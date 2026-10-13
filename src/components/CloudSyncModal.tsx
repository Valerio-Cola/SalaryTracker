import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  SyncCredentials,
  getSyncCredentials,
  saveSyncCredentials,
  loginToCloud,
  pushToCloud,
  pullFromCloud,
  deleteAccountFromCloud,
} from '../utils/syncService';
import { DEFAULT_CONFIG, DEFAULT_TEMPLATES } from '../utils/storage';
import { ContractConfig, Shift, QuickTemplate } from '../types';
import { TurnstileWidget } from './TurnstileWidget';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    workerUrl?: boolean;
    userKey?: boolean;
    passcode?: boolean;
    terms?: boolean;
  }>({});
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Stato per cancellazione account (GDPR Art. 17)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState<string>('');
  const [deleteLocalAlso, setDeleteLocalAlso] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getSyncCredentials();
      setCreds(stored);
      setIsLoggedIn(Boolean(stored.workerUrl && stored.userKey && stored.passcode));
      setStatusMessage(null);
      setTurnstileToken('');
      setAcceptedTerms(false);
      setValidationErrors({});
      setIsShaking(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmationInput('');
      setDeleteLocalAlso(true);
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    // Verifica campi obbligatori
    const errors: {
      workerUrl?: boolean;
      userKey?: boolean;
      passcode?: boolean;
      terms?: boolean;
    } = {};

    if (!creds.workerUrl || !creds.workerUrl.trim()) {
      errors.workerUrl = true;
    }
    if (!creds.userKey || !creds.userKey.trim()) {
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
      if (errors.workerUrl) missing.push('URL Cloudflare Worker');
      if (errors.userKey) missing.push('Nome Utente');
      if (errors.passcode) missing.push('Password/PIN');
      if (errors.terms) missing.push('Accettazione Avviso Legale');

      setStatusMessage({
        type: 'error',
        text: `Compilazione incompleta: ${missing.join(', ')}. Verifica i campi evidenziati in rosso.`,
      });
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setStatusMessage(null);

    const updatedCreds = { ...creds, autoSync: true };
    saveSyncCredentials(updatedCreds);

    // Effettua login/auth con il token Turnstile
    const res = await loginToCloud(updatedCreds, turnstileToken);
    
    if (res.success) {
      if (res.data) {
        // Se il cloud ha già dati per questo utente, applicali
        onApplyCloudData({
          config: res.data.config,
          shifts: res.data.shifts,
          templates: res.data.templates,
        });
        setIsLoggedIn(true);
        setStatusMessage({ type: 'success', text: 'Login effettuato! Dati scaricati dal cloud e sincronizzazione automatica attiva.' });
        onShowNotification('Login effettuato e dati sincronizzati!');
        setCreds((prev) => ({ ...prev, autoSync: true, lastSyncedAt: res.data?.updatedAt }));
      } else {
        // Se l'utente non ha ancora dati salvati nel cloud, carica quelli locali attuali
        const pushRes = await pushToCloud(updatedCreds, { config, shifts, templates });
        if (pushRes.success) {
          setIsLoggedIn(true);
          setStatusMessage({ type: 'success', text: 'Login effettuato! Account creato e dati locali sincronizzati sul cloud.' });
          onShowNotification('Account collegato e dati salvati sul cloud!');
          setCreds((prev) => ({ ...prev, autoSync: true, lastSyncedAt: pushRes.updatedAt }));
        } else {
          setStatusMessage({ type: 'error', text: pushRes.message });
        }
      }
    } else {
      setStatusMessage({ type: 'error', text: res.message });
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

    setIsDeleting(true);
    setStatusMessage(null);

    const res = await deleteAccountFromCloud(creds);

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

      if (deleteLocalAlso) {
        onApplyCloudData({
          config: DEFAULT_CONFIG,
          shifts: [],
          templates: DEFAULT_TEMPLATES,
        });
      }

      setStatusMessage({
        type: 'success',
        text: 'Account e dati cloud eliminati definitivamente (GDPR Art. 17 - Diritto all\'Oblio).',
      });
      onShowNotification('Account e dati cloud eliminati con successo.');
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
        {/* Header Modale */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Sincronizzazione Multi-Device
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Modale */}
        <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto">
          {/* Banner Stato e Condizioni di Accesso al Servizio */}
          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-blue-950 dark:text-blue-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[14.44px] font-bold text-blue-900 dark:text-blue-100">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Sincronizzazione Multi-Device Cloud
            </div>
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
              Se disponi delle credenziali rilasciate dall&apos;amministratore, inserisci di seguito l&apos;URL del Worker, il tuo Nome Utente e la Password.
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
                          Questa operazione è <strong>irreversibile</strong>. Tutti i tuoi dati salvati su Cloudflare KV (turni, tariffe, spese e credenziali) verranno distrutti immediatamente.
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
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Annulla
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmationInput.trim().toUpperCase() !== 'ELIMINA' || isDeleting}
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
            /* VISTA NON LOGGATO (FORM ACCESSO CON TURNSTILE) */
            <div className="space-y-4">
              <div className="space-y-4">
                {/* URL Worker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    URL del tuo Cloudflare Worker
                  </label>
                  <input
                    type="url"
                    placeholder="https://tuo-worker.workers.dev"
                    value={creds.workerUrl}
                    onChange={(e) => {
                      setCreds({ ...creds, workerUrl: e.target.value });
                      if (validationErrors.workerUrl) setValidationErrors((prev) => ({ ...prev, workerUrl: false }));
                    }}
                    className={`w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden font-mono transition-all ${
                      validationErrors.workerUrl
                        ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.workerUrl && (
                    <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Inserisci l&apos;URL del Worker Cloudflare
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                      Password o PIN
                    </label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={creds.passcode}
                      onChange={(e) => {
                        setCreds({ ...creds, passcode: e.target.value });
                        if (validationErrors.passcode) setValidationErrors((prev) => ({ ...prev, passcode: false }));
                      }}
                      className={`w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all ${
                        validationErrors.passcode
                          ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.passcode && (
                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> Inserisci la password o PIN
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkbox Presa Visione & Accettazione Avviso Legale Cloud (INGRANDITA e posizionata SOPRA Cloudflare) */}
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
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setTurnstileToken('')}
                  />
                </div>
              </div>

              {/* Pulsante Login con Animazione Shake e Rosso in caso di errore */}
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
                      Connessione in corso...
                    </>
                  ) : isShaking ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Dati Mancanti o Non Accettati!
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

          {/* Messaggio di stato */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg text-[11px] flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
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
