import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Cloud,
  KeyRound,
  User,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  LogIn,
  LogOut,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Shield,
} from 'lucide-react';
import {
  SyncCredentials,
  DEFAULT_WORKER_URL,
  getSyncCredentials,
  saveSyncCredentials,
  loginToCloud,
  pushToCloud,
  pullFromCloud,
  deleteAccountFromCloud,
} from '../utils/syncService';
import { DEFAULT_CONFIG, DEFAULT_TEMPLATES } from '../utils/storage';
import { ContractConfig, Shift, QuickTemplate } from '../types';
import { TurnstileWidget, TurnstileWidgetRef } from './TurnstileWidget';

export interface PasswordStrength {
  score: number; // 0..4
  label: string;
  color: string;
  textColor: string;
  criteria: {
    minLength: boolean; // >= 8 caratteri
    hasLetter: boolean; // lettere
    hasUpper: boolean; // maiuscole
    hasNumber: boolean; // numeri
    hasSpecial: boolean; // caratteri speciali
    notCommon: boolean; // non banale o coincidente con username
  };
  isValid: boolean; // robustezza sufficiente per la registrazione
}

const COMMON_WEAK_PASSWORDS = new Set([
  '123456',
  '12345678',
  '123456789',
  'password',
  'qwerty',
  'admin',
  'passcode',
  '111111',
  '000000',
  '123123',
  'welcome',
  'iloveyou',
  'administrator',
]);

export function evaluatePasswordStrength(password: string, username: string = ''): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Non inserita',
      color: 'bg-slate-200 dark:bg-slate-700',
      textColor: 'text-slate-400',
      criteria: {
        minLength: false,
        hasLetter: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false,
        notCommon: true,
      },
      isValid: false,
    };
  }

  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const cleanLower = password.toLowerCase();
  const userLower = username.trim().toLowerCase();
  const containsUsername = userLower.length >= 3 && cleanLower.includes(userLower);
  const notCommon = !COMMON_WEAK_PASSWORDS.has(cleanLower) && !containsUsername;

  let score = 0;
  if (minLength) score++;
  if (password.length >= 12) score++;
  if (hasLetter && hasNumber) score++;
  if (hasUpper && hasSpecial) score++;

  if (!notCommon || password.length < 6) {
    score = 0;
  }

  const scoreLabels = ['Molto debole', 'Debole', 'Media', 'Forte', 'Molto forte'];
  const scoreColors = [
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-emerald-600',
  ];
  const scoreTextColors = [
    'text-rose-600 dark:text-rose-400',
    'text-orange-600 dark:text-orange-400',
    'text-amber-600 dark:text-amber-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-emerald-700 dark:text-emerald-300',
  ];

  const clampedScore = Math.min(4, Math.max(0, score));

  return {
    score: clampedScore,
    label: scoreLabels[clampedScore],
    color: scoreColors[clampedScore],
    textColor: scoreTextColors[clampedScore],
    criteria: {
      minLength,
      hasLetter,
      hasUpper,
      hasNumber,
      hasSpecial,
      notCommon,
    },
    // Valida se ha almeno 8 caratteri, lettere e numeri, e non è banale
    isValid: minLength && hasLetter && hasNumber && notCommon,
  };
}

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ContractConfig;
  shifts: Shift[];
  templates: QuickTemplate[];
  onApplyCloudData: (data: { config: ContractConfig; shifts: Shift[]; templates: QuickTemplate[] }) => void;
  onShowNotification: (msg: string) => void;
  onOpenPrivacyModal?: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  shifts,
  templates,
  onApplyCloudData,
  onShowNotification,
  onOpenPrivacyModal,
}) => {
  const [creds, setCreds] = useState<SyncCredentials>(getSyncCredentials());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const initialStored = getSyncCredentials();
    return Boolean(initialStored.workerUrl && initialStored.userKey && initialStored.passcode);
  });
  // Tab di autenticazione: 'login' (Accedi) o 'register' (Primo Accesso)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileTokenRef = useRef<string>('');
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const updateTurnstileToken = (token: string) => {
    turnstileTokenRef.current = token;
    setTurnstileToken(token);
  };

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    userKey?: boolean;
    passcode?: boolean;
    terms?: boolean;
  }>({});
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Riferimenti per lo scorrimento automatico alla fine del modale / sul banner di errore
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const statusMessageRef = useRef<HTMLDivElement>(null);

  const scrollToErrorBanner = () => {
    setTimeout(() => {
      if (statusMessageRef.current) {
        statusMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else if (modalBodyRef.current) {
        modalBodyRef.current.scrollTo({
          top: modalBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  // Stato per cancellazione account (GDPR Art. 17)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState<string>('');
  const [deletePasswordInput, setDeletePasswordInput] = useState<string>('');
  const [deletePasswordError, setDeletePasswordError] = useState<boolean>(false);
  const [deleteLocalAlso, setDeleteLocalAlso] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Calcolo dinamico robustezza password
  const passwordStrength = evaluatePasswordStrength(creds.passcode, creds.userKey);

  useEffect(() => {
    if (statusMessage) {
      scrollToErrorBanner();
    }
  }, [statusMessage]);

  useEffect(() => {
    if (isOpen) {
      const stored = getSyncCredentials();
      setCreds(stored);
      setIsLoggedIn(Boolean(stored.workerUrl && stored.userKey && stored.passcode));
      setStatusMessage(null);
      updateTurnstileToken('');
      turnstileRef.current?.reset();
      setAcceptedTerms(false);
      setValidationErrors({});
      setIsShaking(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmationInput('');
      setDeletePasswordInput('');
      setDeletePasswordError(false);
      setDeleteLocalAlso(true);
      setIsDeleting(false);
      setShowPassword(false);
      setAuthMode('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    // Verifica campi obbligatori
    const errors: {
      userKey?: boolean;
      passcode?: boolean;
      terms?: boolean;
    } = {};

    const cleanUser = creds.userKey ? creds.userKey.trim() : '';

    if (!cleanUser) {
      errors.userKey = true;
    }
    if (!creds.passcode || !creds.passcode.trim()) {
      errors.passcode = true;
    }
    if (!acceptedTerms) {
      errors.terms = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      const missing: string[] = [];
      if (errors.userKey) missing.push('Nome Utente');
      if (errors.passcode) missing.push('Password');
      if (errors.terms) missing.push('Accettazione Avviso Legale');

      setStatusMessage({
        type: 'error',
        text: `Compilazione incompleta: ${missing.join(', ')}. Verifica i campi evidenziati in rosso.`,
      });
      scrollToErrorBanner();
      return;
    }

    // Verifica robustezza minima password SOLO per la scheda "Primo Accesso"
    if (authMode === 'register' && !passwordStrength.isValid) {
      setValidationErrors((prev) => ({ ...prev, passcode: true }));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      const tips: string[] = [];
      if (!passwordStrength.criteria.minLength) tips.push('almeno 8 caratteri');
      if (!passwordStrength.criteria.hasLetter || !passwordStrength.criteria.hasNumber) tips.push('lettere e numeri');
      if (!passwordStrength.criteria.hasUpper) tips.push('una maiuscola');
      if (!passwordStrength.criteria.hasSpecial) tips.push('un simbolo speciale');

      setStatusMessage({
        type: 'error',
        text: `Password debole: per completare il primo accesso crea una password con ${tips.join(', ')}.`,
      });
      scrollToErrorBanner();
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setStatusMessage(null);

    // Se il token Turnstile è in fase di generazione, attendi un istante
    let tokenToSend = turnstileTokenRef.current;
    if (!tokenToSend && typeof window !== 'undefined' && window.turnstile) {
      setStatusMessage({
        type: 'info',
        text: 'Verifica di sicurezza anti-bot in corso, attendi un istante...',
      });
      const startWait = Date.now();
      while (!tokenToSend && Date.now() - startWait < 3000) {
        await new Promise((r) => setTimeout(r, 150));
        tokenToSend = turnstileTokenRef.current;
      }
    }

    const effectiveWorkerUrl = (creds.workerUrl && creds.workerUrl.trim()) ? creds.workerUrl.trim() : DEFAULT_WORKER_URL;
    const credsToTest: SyncCredentials = { ...creds, userKey: cleanUser, workerUrl: effectiveWorkerUrl, autoSync: true };

    // Effettua login/auth passando authMode ('login' o 'register')
    const res = await loginToCloud(credsToTest, tokenToSend, authMode);

    // IMPORTANTE: il token Cloudflare Turnstile è rigorosamente MONOUSO.
    // Una volta inviato e verificato via /siteverify dal Worker, il token non può più essere utilizzato.
    // Lo invalidiamo subito e chiediamo al widget Turnstile di rigenerarne uno fresco per eventuali successivi tentativi.
    updateTurnstileToken('');
    turnstileRef.current?.reset();
    
    if (res.success) {
      if (res.data) {
        // Se il cloud ha già dati per questo utente, applicali
        onApplyCloudData({
          config: res.data.config,
          shifts: res.data.shifts,
          templates: res.data.templates,
        });
        const finalCreds = { ...credsToTest, lastSyncedAt: res.data?.updatedAt };
        saveSyncCredentials(finalCreds);
        setCreds(finalCreds);
        setIsLoggedIn(true);
        setStatusMessage({
          type: 'success',
          text: authMode === 'register'
            ? 'Primo accesso completato! Password impostata e dati sincronizzati con successo.'
            : 'Login effettuato! Dati scaricati dal cloud e sincronizzazione automatica attiva.',
        });
        onShowNotification(
          authMode === 'register'
            ? 'Primo accesso completato!'
            : 'Login effettuato e dati sincronizzati!'
        );
      } else {
        // Se l'utente non ha ancora dati salvati nel cloud, carica quelli locali attuali
        const pushRes = await pushToCloud(credsToTest, { config, shifts, templates });
        if (pushRes.success) {
          const finalCreds = { ...credsToTest, lastSyncedAt: pushRes.updatedAt };
          saveSyncCredentials(finalCreds);
          setCreds(finalCreds);
          setIsLoggedIn(true);
          setStatusMessage({
            type: 'success',
            text: authMode === 'register'
              ? 'Primo accesso completato! Password impostata e dati salvati sul cloud.'
              : 'Login effettuato! Account creato e dati locali sincronizzati sul cloud.',
          });
          onShowNotification(
            authMode === 'register'
              ? 'Primo accesso completato e dati salvati!'
              : 'Account collegato e dati salvati sul cloud!'
          );
        } else {
          setStatusMessage({ type: 'error', text: pushRes.message });
          scrollToErrorBanner();
        }
      }
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setStatusMessage({ type: 'error', text: res.message });
      scrollToErrorBanner();
    }

    setLoading(false);
  };

  const handleManualSync = async () => {
    setLoading(true);
    setStatusMessage(null);

    const res = await pullFromCloud(creds);
    if (res.success && res.data) {
      onApplyCloudData({
        config: res.data.config,
        shifts: res.data.shifts,
        templates: res.data.templates,
      });
      const updatedCreds = { ...creds, lastSyncedAt: res.data.updatedAt };
      saveSyncCredentials(updatedCreds);
      setCreds(updatedCreds);
      setStatusMessage({ type: 'success', text: 'Sincronizzazione completata! Dati aggiornati dal cloud.' });
      onShowNotification('Dati sincronizzati dal cloud!');
    } else if (res.success) {
      const pushRes = await pushToCloud(creds, { config, shifts, templates });
      if (pushRes.success) {
        const updatedCreds = { ...creds, lastSyncedAt: pushRes.updatedAt };
        saveSyncCredentials(updatedCreds);
        setCreds(updatedCreds);
        setStatusMessage({ type: 'success', text: 'Dati sincronizzati sul cloud con successo!' });
        onShowNotification('Dati salvati sul cloud!');
      } else {
        setStatusMessage({ type: 'error', text: pushRes.message });
      }
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }

    setLoading(false);
  };

  const handleLogout = () => {
    const cleared = {
      workerUrl: creds.workerUrl,
      userKey: '',
      passcode: '',
      autoSync: true,
    };
    saveSyncCredentials(cleared);
    setCreds(cleared);
    setIsLoggedIn(false);

    // Reset dei dati locali del calendario e delle impostazioni
    onApplyCloudData({
      config: DEFAULT_CONFIG,
      shifts: [],
      templates: DEFAULT_TEMPLATES,
    });

    setStatusMessage({
      type: 'success',
      text: 'Disconnessione effettuata. Gli orari ed i dati locali del calendario sono stati rimossi da questo dispositivo.',
    });
    onShowNotification('Disconnesso dal Cloud. Dati locali del calendario rimossi.');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.trim().toUpperCase() !== 'ELIMINA') {
      setStatusMessage({
        type: 'error',
        text: 'Digita la parola ELIMINA per confermare la cancellazione dell\'account.',
      });
      return;
    }

    if (!deletePasswordInput.trim()) {
      setDeletePasswordError(true);
      setStatusMessage({
        type: 'error',
        text: 'Inserisci la password dell\'account per confermare la cancellazione definitiva.',
      });
      return;
    }

    setIsDeleting(true);
    setStatusMessage(null);

    const res = await deleteAccountFromCloud(creds, deletePasswordInput.trim());

    if (res.success) {
      const cleared = {
        workerUrl: creds.workerUrl,
        userKey: '',
        passcode: '',
        autoSync: true,
      };
      saveSyncCredentials(cleared);
      setCreds(cleared);
      setIsLoggedIn(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmationInput('');
      setDeletePasswordInput('');
      setDeletePasswordError(false);

      if (deleteLocalAlso) {
        onApplyCloudData({
          config: DEFAULT_CONFIG,
          shifts: [],
          templates: DEFAULT_TEMPLATES,
        });
      }

      setStatusMessage({
        type: 'success',
        text: 'Account, autorizzazione e dati cloud rimossi definitivamente (GDPR Art. 17).',
      });
      onShowNotification('Account e autorizzazione rimossi dal cloud con successo.');
    } else {
      setStatusMessage({
        type: 'error',
        text: res.message || 'Errore durante la cancellazione dell\'account dal cloud.',
      });
    }

    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg my-6 max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header Modale - Gradiente Elegante */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20 shadow-inner flex items-center justify-center font-bold shrink-0">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Sincronizzazione Multi-Device Cloud
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Modale */}
        <div ref={modalBodyRef} className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto">
          {/* Banner Stato e Condizioni di Accesso al Servizio */}
          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-blue-950 dark:text-blue-200 space-y-1.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[10px] text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Accesso Limitato e Riservato
              </div>
              <p className="text-[11px] leading-relaxed">
                Il servizio di sincronizzazione cloud è ad accesso limitato e riservato esclusivamente agli utenti espressamente autorizzati dall&apos;amministratore, <strong>senza registrazione pubblica</strong>. Non costituisce una piattaforma SaaS aperta al pubblico.
              </p>
              <div className="pt-1 border-t border-amber-200/60 dark:border-amber-900/40 text-[11.5px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                <strong>Nota su donazioni &amp; account:</strong> Il supporto volontario tramite Ko-fi è una libera donazione e non costituisce acquisto o compravendita di servizi. Effettuare o non effettuare donazioni non preclude la possibilità di avere un account autorizzato, il cui rilascio rimane a discrezione esclusiva dell&apos;amministratore.
              </div>
            </div>
            <p className="text-[11px] text-blue-800/90 dark:text-blue-300/90">
              Se disponi delle credenziali rilasciate dall&apos;amministratore, inserisci di seguito il tuo Nome Utente e la Password.
            </p>
          </div>

          {isLoggedIn ? (
            /* VISTA UTENTE LOGGATO */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Account Collegato
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        {creds.userKey}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
                    Attivo
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono truncate">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{creds.workerUrl}</span>
                </div>
              </div>

              {/* Azioni per Utente Connesso */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={loading || isDeleting}
                  className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Sincronizza Ora
                </button>

                <button
                  onClick={handleLogout}
                  disabled={loading || isDeleting}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnetti
                </button>
              </div>

              {/* Sezione Eliminazione Account & Dati Cloud (GDPR Art. 17 - Diritto all'Oblio) */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                {!showDeleteConfirm ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Eliminazione Account &amp; Dati Cloud
                      </div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Distruggi definitivamente il profilo e tutti i turni salvati sul cloud (Art. 17 GDPR).
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setDeleteConfirmationInput('');
                        setDeletePasswordInput('');
                        setDeletePasswordError(false);
                        setDeleteLocalAlso(true);
                      }}
                      disabled={loading || isDeleting}
                      className="px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 hover:border-rose-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Elimina Account
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          Conferma Eliminazione Definitiva Account
                        </h4>
                        <p className="text-[11px] text-rose-800/90 dark:text-rose-300/90 leading-relaxed mt-0.5">
                          Questa operazione è <strong>irreversibile</strong>. Tutti i tuoi dati salvati su Cloudflare KV (turni, tariffe, spese) verranno distrutti immediatamente e il tuo account verrà rimosso dagli utenti autorizzati del server.
                        </p>
                      </div>
                    </div>

                    {/* Scelta dati locali */}
                    <label className="flex items-start gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
                      <input
                        type="checkbox"
                        checked={deleteLocalAlso}
                        onChange={(e) => setDeleteLocalAlso(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600 shrink-0 mt-0.5"
                      />
                      <span className="leading-tight">
                        Rimuovi anche tutti i dati e i turni memorizzati localmente su questo dispositivo (reset completo).
                      </span>
                    </label>

                    {/* Campo di conferma Password dell'account */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                        Inserisci la tua password di accesso:
                      </label>
                      <input
                        type="password"
                        placeholder="Password attuale"
                        value={deletePasswordInput}
                        onChange={(e) => {
                          setDeletePasswordInput(e.target.value);
                          if (deletePasswordError) setDeletePasswordError(false);
                        }}
                        className={`w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all ${
                          deletePasswordError
                            ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-50/40'
                            : 'border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500'
                        }`}
                      />
                      {deletePasswordError && (
                        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" /> Inserisci la password per autorizzare l&apos;eliminazione
                        </p>
                      )}
                    </div>

                    {/* Campo di conferma ELIMINA */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Digita <span className="text-rose-600 font-mono font-bold">ELIMINA</span> per confermare:
                      </label>
                      <input
                        type="text"
                        placeholder="ELIMINA"
                        value={deleteConfirmationInput}
                        onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Pulsanti Annulla / Procedi */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePasswordInput('');
                          setDeleteConfirmationInput('');
                          setDeletePasswordError(false);
                        }}
                        disabled={isDeleting}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Annulla
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={
                          deleteConfirmationInput.trim().toUpperCase() !== 'ELIMINA' ||
                          !deletePasswordInput.trim() ||
                          isDeleting
                        }
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Eliminazione...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            Elimina Definitivamente
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VISTA NON LOGGATO (FORM ACCESSO O PRIMO ACCESSO) */
            <div className="space-y-4">
              {/* Tab Switch: Accedi vs Primo Accesso (Stile Turno / Ferie) */}
              <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div className="grid grid-cols-2 gap-2 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setStatusMessage(null);
                      setValidationErrors({});
                      updateTurnstileToken('');
                      turnstileRef.current?.reset();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Accedi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setStatusMessage(null);
                      setValidationErrors({});
                      updateTurnstileToken('');
                      turnstileRef.current?.reset();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Primo Accesso</span>
                  </button>
                </div>
                <div className="mt-1.5 text-center px-1">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {authMode === 'login'
                      ? 'Hai già configurato la password? Inserisci le tue credenziali per entrare.'
                      : 'Primo accesso con il tuo account autorizzato? Crea la tua password sicura.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  {/* Nome Utente */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      Nome Utente
                    </label>
                    <input
                      type="text"
                      placeholder="Nome utente"
                      value={creds.userKey}
                      onChange={(e) => {
                        setCreds({ ...creds, userKey: e.target.value });
                        if (validationErrors.userKey) setValidationErrors((prev) => ({ ...prev, userKey: false }));
                        if (statusMessage) setStatusMessage(null);
                      }}
                      className={`w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all ${
                        validationErrors.userKey
                          ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.userKey && (
                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> Inserisci il nome utente
                      </p>
                    )}
                  </div>

                  {/* Password / PIN */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                        Password
                      </label>
                      {authMode === 'register' && creds.passcode.length > 0 && (
                        <span className={`text-[11px] sm:text-xs font-bold ${passwordStrength.textColor}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={authMode === 'register' ? 'Crea una password sicura' : 'Inserisci la tua password'}
                        value={creds.passcode}
                        onChange={(e) => {
                          setCreds({ ...creds, passcode: e.target.value });
                          if (validationErrors.passcode) setValidationErrors((prev) => ({ ...prev, passcode: false }));
                          if (statusMessage) setStatusMessage(null);
                        }}
                        className={`w-full pl-2.5 pr-8 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all ${
                          validationErrors.passcode
                            ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                        title={showPassword ? 'Nascondi password' : 'Mostra password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {validationErrors.passcode && (
                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {!creds.passcode
                          ? 'Inserisci la password'
                          : authMode === 'register'
                          ? 'Password troppo debole: rispetta tutti i requisiti di sicurezza'
                          : 'Inserisci la tua password'}
                      </p>
                    )}

                    {/* Barra di robustezza dinamica e Checklist a 4 indicatori: SOLO in Primo Accesso */}
                    {authMode === 'register' && creds.passcode.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="grid grid-cols-4 gap-1 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrength.score >= step
                                  ? passwordStrength.color
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Checklist dei requisiti di sicurezza */}
                        <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 pt-1.5 text-[11.5px]">
                          <span
                            className={`flex items-center gap-1.5 ${
                              passwordStrength.criteria.minLength
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <Check className="w-3 h-3 shrink-0" /> 8+ caratteri
                          </span>
                          <span
                            className={`flex items-center gap-1.5 ${
                              passwordStrength.criteria.hasLetter && passwordStrength.criteria.hasNumber
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <Check className="w-3 h-3 shrink-0" /> Lettere &amp; numeri
                          </span>
                          <span
                            className={`flex items-center gap-1.5 ${
                              passwordStrength.criteria.hasUpper
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <Check className="w-3 h-3 shrink-0" /> Maiuscola
                          </span>
                          <span
                            className={`flex items-center gap-1.5 ${
                              passwordStrength.criteria.hasSpecial
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <Check className="w-3 h-3 shrink-0" /> Simbolo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opzioni server avanzate (facoltativo, preconfigurato) */}
                <details className="text-left group pt-0.5">
                  <summary className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer list-none flex items-center gap-1.5 select-none w-fit">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Opzioni server avanzate (facoltativo)</span>
                    <span className="text-[9px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Endpoint Cloudflare Worker (Predefinito)
                    </label>
                    <input
                      type="url"
                      value={creds.workerUrl}
                      onChange={(e) => setCreds({ ...creds, workerUrl: e.target.value })}
                      placeholder={DEFAULT_WORKER_URL}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Preconfigurato per il server cloud ufficiale. Lascia invariato per la normale sincronizzazione.
                    </p>
                  </div>
                </details>

                {/* Checkbox Presa Visione & Accettazione Avviso Legale Cloud */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    validationErrors.terms
                      ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-500/50 shadow-xs shadow-rose-500/10'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (validationErrors.terms) setValidationErrors((prev) => ({ ...prev, terms: false }));
                      }}
                      className="w-5 h-5 min-w-[20px] min-h-[20px] mt-0.5 rounded-md border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                    />
                    <div className="flex-1 text-xs sm:text-[13px] leading-snug font-medium text-slate-800 dark:text-slate-200">
                      <span>Attivando la sincronizzazione, confermi di aver letto e accettato l&apos;</span>
                      <button
                        type="button"
                        onClick={() => onOpenPrivacyModal?.()}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-bold text-left inline cursor-pointer mx-1"
                      >
                        Avviso Legale e l&apos;Informativa sul trattamento dei dati nel Cloud
                      </button>
                      <span>.</span>
                    </div>
                  </label>
                  {validationErrors.terms && (
                    <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-2 border-t border-rose-200/80 dark:border-rose-900/60 mt-2.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Spunta obbligatoria: conferma di aver letto e accettato l&apos;Avviso Legale per procedere.
                    </div>
                  )}
                </div>

                {/* Widget Anti-bot Cloudflare Turnstile */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 text-center flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                    Verifica di sicurezza anti-bot prima dell&apos;accesso
                  </div>
                  <TurnstileWidget
                    ref={turnstileRef}
                    onVerify={(token) => updateTurnstileToken(token)}
                    onExpire={() => updateTurnstileToken('')}
                    onError={() => updateTurnstileToken('')}
                  />
                </div>
              </div>

              {/* Pulsante Login / Primo Accesso */}
              <div className="pt-1">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isShaking
                      ? 'animate-shake bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-400 shadow-rose-500/40 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {authMode === 'register' ? 'Configurazione in corso...' : 'Connessione in corso...'}
                    </>
                  ) : isShaking ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Dati Mancanti o Non Accettati!
                    </>
                  ) : authMode === 'register' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Registrati
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Accedi e Sincronizza
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Messaggio di stato (con scroll automatico in vista) */}
          {statusMessage && (
            <div
              ref={statusMessageRef}
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all shadow-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : statusMessage.type === 'info'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'info' ? (
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="font-semibold leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {creds.lastSyncedAt && (
            <div className="text-center text-[9.5px] text-slate-400 flex items-center justify-center gap-1">
              <RefreshCw className="w-3 h-3 text-emerald-500" />
              Ultimo aggiornamento cloud:{' '}
              {new Date(creds.lastSyncedAt).toLocaleString('it-IT')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
