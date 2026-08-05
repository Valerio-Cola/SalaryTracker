import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  KeyRound,
  User,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  SyncCredentials,
  getSyncCredentials,
  saveSyncCredentials,
  pushToCloud,
  pullFromCloud,
} from '../utils/syncService';
import { ContractConfig, Shift, QuickTemplate } from '../types';

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
  const [loadingAction, setLoadingAction] = useState<'push' | 'pull' | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCreds(getSyncCredentials());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCreds = () => {
    saveSyncCredentials(creds);
    onShowNotification('Impostazioni di sincronizzazione salvate!');
  };

  const handlePush = async () => {
    if (!creds.workerUrl || !creds.userKey || !creds.passcode) {
      setStatusMessage({
        type: 'error',
        text: 'Compila tutti i campi (URL Worker, Utente e Password) prima di salvare.',
      });
      return;
    }

    setLoadingAction('push');
    setStatusMessage(null);
    saveSyncCredentials(creds);

    const res = await pushToCloud(creds, { config, shifts, templates });
    setLoadingAction(null);

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      onShowNotification('Sincronizzazione completata con successo!');
      setCreds((prev) => ({ ...prev, lastSyncedAt: res.updatedAt }));
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handlePull = async () => {
    if (!creds.workerUrl || !creds.userKey || !creds.passcode) {
      setStatusMessage({
        type: 'error',
        text: 'Compila tutti i campi (URL Worker, Utente e Password) prima di scaricare.',
      });
      return;
    }

    setLoadingAction('pull');
    setStatusMessage(null);
    saveSyncCredentials(creds);

    const res = await pullFromCloud(creds);
    setLoadingAction(null);

    if (res.success && res.data) {
      onApplyCloudData({
        config: res.data.config,
        shifts: res.data.shifts,
        templates: res.data.templates,
      });
      setStatusMessage({ type: 'success', text: res.message });
      onShowNotification('Dati scaricati e applicati dal Cloud!');
      setCreds((prev) => ({ ...prev, lastSyncedAt: res.data?.updatedAt }));
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden transition-colors">
        {/* Header Modale */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sincronizzazione Multi-Device
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Modale */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Informazione iniziale */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-200">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Sincronizzazione riservata con credenziali
            </p>
          </div>

          {/* Form Credenziali */}
          <div className="space-y-4">
            {/* URL Worker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                URL del tuo Cloudflare Worker
              </label>
              <input
                type="url"
                placeholder=""
                value={creds.workerUrl}
                onChange={(e) => setCreds({ ...creds, workerUrl: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
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
                  placeholder="Scegli nome utente"
                  value={creds.userKey}
                  onChange={(e) => setCreds({ ...creds, userKey: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password / PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                  Password o PIN
                </label>
                <input
                  type="password"
                  placeholder="Scegli una password"
                  value={creds.passcode}
                  onChange={(e) => setCreds({ ...creds, passcode: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Checkbox Sincronizzazione Automatica */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Sincronizzazione Automatica
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Invia le modifiche al cloud automaticamente ad ogni nuovo turno o modifica
                </span>
              </div>
              <input
                type="checkbox"
                checked={creds.autoSync}
                onChange={(e) => {
                  const updated = { ...creds, autoSync: e.target.checked };
                  setCreds(updated);
                  saveSyncCredentials(updated);
                }}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Messaggio di stato */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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

          {/* Pulsanti Azione Push / Pull */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handlePush}
              disabled={loadingAction !== null}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loadingAction === 'push' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              Invia al Cloud (Upload)
            </button>

            <button
              onClick={handlePull}
              disabled={loadingAction !== null}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loadingAction === 'pull' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudDownload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
              Scarica dal Cloud (Download)
            </button>
          </div>

          {creds.lastSyncedAt && (
            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <RefreshCw className="w-3 h-3 text-emerald-500" />
              Ultimo aggiornamento cloud:{' '}
              {new Date(creds.lastSyncedAt).toLocaleString('it-IT')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              handleSaveCreds();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
