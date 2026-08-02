import React from 'react';
import { X, ShieldCheck, Database, Lock, AlertCircle, FileText } from 'lucide-react';

interface PrivacyLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyLegalModal: React.FC<PrivacyLegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-colors">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Note Legali & Privacy Policy</h2>
              <p className="text-xs text-slate-400">Trasparenza, protezione dati e disclaimer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 transition-colors">
          
          {/* Disclaimer Legale Box */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-950 dark:text-amber-100">Disclaimer di Calcolo</strong>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                Strumento di calcolo indicativo ad uso personale. Non costituisce documento ufficiale né busta paga aziendale. I valori calcolati costituiscono una stima basata sui dati inseriti dall&apos;utente e sui parametri di tariffa impostati.
              </p>
            </div>
          </div>

          {/* Privacy & Cookie */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                100% Locale / Client-Side
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                L&apos;applicazione funziona interamente nel tuo browser (Client-side) tramite <strong>LocalStorage</strong>. Tutti i dati sui turni, le ore e la configurazione dello stipendio risiedono unicamente nel dispositivo del singolo utente. Nessun dato personale o lavorativo viene memorizzato o inviato a server terzi.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cookie & Tracciamento zero
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                L&apos;app non utilizza cookie di tracciamento, cookie analitici o cookie di terze parti. Non vengono impiegati strumenti di tracciamento pubblicitario o profilazione utente.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Proprietà e Diritti
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                Puoi ospitare liberamente l&apos;applicazione su GitHub Pages, Vercel o qualsiasi altro hosting statico per il tuo uso personale o per i tuoi colleghi.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              I tuoi dati sono al sicuro nel tuo browser.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
