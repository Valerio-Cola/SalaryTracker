import React from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Calendar,
  FileCode2,
  Sparkles,
  Share2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthTitle: string;
  onPrintPdf: () => void;
  onExportCsv: () => void;
  onExportGoogleCalendar: () => void;
  onExportJson: () => void;
  onImportJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenShare?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  monthTitle,
  onPrintPdf,
  onExportCsv,
  onExportGoogleCalendar,
  onExportJson,
  onImportJson,
  onOpenShare,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-hidden">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] transition-all overflow-hidden">
        
        {/* Header Modal - Compatto e fisso in cima */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/20 shadow-inner">
              <Printer className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
                Stampa ed Esporta
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                Scegli il formato per <span className="font-bold text-white capitalize">{monthTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenuto a scorrimento verticale che si adatta a ogni schermo mobile */}
        <div className="p-3 sm:p-4 space-y-2 overflow-y-auto overscroll-contain flex-1 no-scrollbar sm:scrollbar-thin">
          
          {/* Opzione In evidenza: Condividi su WhatsApp & Social */}
          {onOpenShare && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShare();
              }}
              className="w-full text-left p-3 rounded-xl sm:rounded-2xl border border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs shadow-emerald-500/30">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    Condividi su WhatsApp & Social
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                      Novità
                    </span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                    Card / Testo
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 leading-snug">
                  Invia i tuoi turni della settimana o del mese via WhatsApp/Telegram o scarica la card grafica HD per amici e famiglia.
                </p>
              </div>
            </button>
          )}

          {/* Opzione 1: PDF / Stampa */}
          <button
            type="button"
            onClick={() => {
              onPrintPdf();
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Stampa o Salva PDF
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                  Documento
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Prospetto riassuntivo del mese con totali ore, maggiorazioni e netto stimato, pronto da stampare o salvare in PDF.
              </p>
            </div>
          </button>

          {/* Opzione 2: CSV per Excel */}
          <button
            type="button"
            onClick={() => {
              onExportCsv();
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  File CSV per Excel
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                  Tabella
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Tutti i turni in formato tabellare per Microsoft Excel, Google Fogli, LibreOffice Calc o Apple Numbers.
              </p>
            </div>
          </button>

          {/* Opzione 3: Compatibile con Google Calendar */}
          <button
            type="button"
            onClick={() => {
              onExportGoogleCalendar();
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Google Calendar
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                  File .ics
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                File iCalendar (.ics) per sincronizzare i turni con orari precisi su Google Calendar, Apple Calendar e Outlook.
              </p>
            </div>
          </button>

          {/* Opzione 4: Backup Completo JSON */}
          <button
            type="button"
            onClick={() => {
              onExportJson();
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCode2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Backup Completo (JSON)
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0">
                  Download
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Salva tutti i turni, spese e tariffe del tuo account in un file JSON per conservarli o ripristinarli su un altro dispositivo.
              </p>
            </div>
          </button>

          {/* Opzione 5: Ripristina Backup da file JSON */}
          {onImportJson && (
            <div>
              <input
                type="file"
                accept=".json,application/json"
                ref={fileInputRef}
                onChange={(e) => {
                  onImportJson(e);
                  onClose();
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left p-3 rounded-xl sm:rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/25 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/35 transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileCode2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      Ripristina Backup da file JSON
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 shrink-0">
                      Ripristina
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80 leading-snug">
                    Carica un file di backup .json precedentemente scaricato per ripristinare tutti i turni, spese e tariffe.
                  </p>
                </div>
              </button>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
