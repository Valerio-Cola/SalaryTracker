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
} from 'lucide-react';
import {
  SyncCredentials,
  getSyncCredentials,
  saveSyncCredentials,
  loginToCloud,
  pushToCloud,
  pullFromCloud,
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
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  shifts,
  templates,
  onApplyCloudData,
  onShowNotification,
}) => {
  const [creds, setCreds] = useState<SyncCredentials>(getSyncCredentials());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const initialStored = getSyncCredentials();
    return Boolean(initialStored.workerUrl && initialStored.userKey && initialStored.passcode);
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const stored = getSyncCredentials();
      setCreds(stored);
      setIsLoggedIn(Boolean(stored.workerUrl && stored.userKey && stored.passcode));
      setStatusMessage(null);
      setTurnstileToken('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!creds.workerUrl || !creds.userKey || !creds.passcode) {
      setStatusMessage({
        type: 'error',
        text: 'Compila tutti i campi (URL Worker, Utente e Password) prima di accedere.',
      });
      return;
    }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg my-6 max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header Modale */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Sincronizzazione Multi-Device
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Modale */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
          {/* Banner Stato e Condizioni di Accesso al Servizio */}
          <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-sm text-blue-950 dark:text-blue-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100 text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              Sincronizzazione Multi-Device Cloud
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Accesso Limitato e Riservato
              </div>
              <p className="leading-relaxed">
                Il servizio di sincronizzazione cloud è ad accesso limitato e riservato esclusivamente agli utenti espressamente autorizzati dall&apos;amministratore, <strong>senza registrazione pubblica</strong>. Non costituisce una piattaforma SaaS aperta al pubblico.
              </p>
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                <strong>Nota su donazioni &amp; account:</strong> Il supporto volontario tramite Ko-fi è una libera donazione e non costituisce acquisto o compravendita di servizi. Effettuare o non effettuare donazioni non preclude la possibilità di avere un account autorizzato, il cui rilascio rimane a discrezione esclusiva dell&apos;amministratore.
              </div>
            </div>
            <p className="text-xs sm:text-sm text-blue-800/90 dark:text-blue-300/90">
              Se disponi delle credenziali rilasciate dall&apos;amministratore, inserisci di seguito l&apos;URL del Worker, il tuo Nome Utente e la Password.
            </p>
          </div>

          {isLoggedIn ? (
            /* VISTA UTENTE LOGGATO */
            <div className="space-y-4">
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Account Collegato
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        <User className="w-4 h-4 text-blue-500" />
                        {creds.userKey}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    Attivo
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono truncate">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{creds.workerUrl}</span>
                </div>
              </div>

              {/* Azioni per Utente Connesso */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                  disabled={loading}
                  className="px-4 py-3 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-bold border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnetti
                </button>
              </div>
            </div>
          ) : (
            /* VISTA NON LOGGATO (FORM ACCESSO CON TURNSTILE) */
            <div className="space-y-4">
              <div className="space-y-4">
                {/* URL Worker */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-500" />
                    URL del tuo Cloudflare Worker
                  </label>
                  <input
                    type="url"
                    placeholder="https://tuo-worker.workers.dev"
                    value={creds.workerUrl}
                    onChange={(e) => setCreds({ ...creds, workerUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Nome Utente */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-500" />
                      Nome Utente
                    </label>
                    <input
                      type="text"
                      placeholder="Nome utente"
                      value={creds.userKey}
                      onChange={(e) => setCreds({ ...creds, userKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Password / PIN */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-blue-500" />
                      Password o PIN
                    </label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={creds.passcode}
                      onChange={(e) => setCreds({ ...creds, passcode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Widget Anti-bot Cloudflare Turnstile */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 text-center flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                    Verifica di sicurezza anti-bot prima dell'accesso
                  </div>
                  <TurnstileWidget
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setTurnstileToken('')}
                  />
                </div>
              </div>

              {/* Pulsante Login */}
              <div className="pt-1">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  Accedi e Sincronizza
                </button>
              </div>
            </div>
          )}

          {/* Messaggio di stato */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {creds.lastSyncedAt && (
            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              Ultimo aggiornamento cloud:{' '}
              {new Date(creds.lastSyncedAt).toLocaleString('it-IT')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
