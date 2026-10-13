import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Settings,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Cloud,
  HelpCircle,
} from 'lucide-react';
import { MonthPickerPopover } from './MonthPickerPopover';
import { ExportModal } from './ExportModal';

interface HeaderProps {
  currentMonthKey: string; // YYYY-MM
  onMonthChange: (monthKey: string) => void;
  onOpenAddShift: () => void;
  onOpenConfig: () => void;
  onOpenCloudSync?: () => void;
  onOpenPrivacy?: () => void;
  onOpenHelp?: () => void;
  onExportCsv: () => void;
  onPrintReport: () => void;
  onExportGoogleCalendar?: () => void;
  onExportJson?: () => void;
  onImportJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateSampleData: () => void;
  hasShifts: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  onMonthChange,
  onOpenAddShift,
  onOpenConfig,
  onOpenCloudSync,
  onOpenHelp,
  onExportCsv,
  onPrintReport,
  onExportGoogleCalendar,
  onExportJson,
  onImportJson,
  onGenerateSampleData,
  hasShifts,
  theme,
  onToggleTheme,
  isCloudConnected = false,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Parsing del mese corrente (es. "2026-08")
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  const dateObj = new Date(year, month, 1);
  const formattedMonth = dateObj.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 1, 1);
    const y = prevDate.getFullYear();
    const m = String(prevDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  return (
    <header id="app-header" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-2.5 sm:py-3 gap-2.5 sm:gap-3 flex-wrap xl:flex-nowrap">
          {/* Logo e Titolo (con Aiuto e Sole/Luna in alto a destra SOLO su Mobile) */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 shrink-0">
                SK
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  Salary Tracker
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Calcolo Stipendio & Turni
                </p>
              </div>
            </div>

            {/* Solo Mobile: Aiuto a sinistra del sole/luna in alto a destra */}
            <div className="flex items-center gap-1.5 sm:hidden shrink-0">
              {onOpenHelp && (
                <button
                  onClick={onOpenHelp}
                  className="px-2.5 py-1.5 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1 transition-colors shrink-0 bg-blue-50/50 dark:bg-blue-950/30 cursor-pointer shadow-2xs"
                  title="Aiuto & Guida del sito"
                >
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Aiuto</span>
                </button>
              )}
              <button
                onClick={onToggleTheme}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center transition-colors shrink-0 cursor-pointer"
                title={theme === 'dark' ? 'Passa alla Modalità Giorno' : 'Passa alla Modalità Notte'}
                aria-label="Toggle tema"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Selettore Mese con Popover Calendario Mese/Anno (ristretto e responsive) */}
          <div className="relative flex items-center justify-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto shrink-0 transition-colors">
            <button
              onClick={handlePrevMonth}
              className="p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all shrink-0 cursor-pointer"
              title="Mese precedente"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => setIsPickerOpen((v) => !v)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 hover:bg-white dark:hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer group"
              title="Apri selettore Mese e Anno"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                {formattedMonth}
              </span>
              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${isPickerOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Vai al mese corrente"
            >
              Oggi
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all shrink-0 cursor-pointer"
              title="Mese successivo"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Popover Calendario Mese & Anno */}
            <MonthPickerPopover
              currentMonthKey={currentMonthKey}
              onSelectMonth={onMonthChange}
              isOpen={isPickerOpen}
              onClose={() => setIsPickerOpen(false)}
            />
          </div>

          {/* Azioni Principali (Scorrevole fluidamente su mobile, responsive su desktop senza tagli) */}
          <div className="flex items-center justify-between sm:justify-end w-full lg:w-auto gap-1 sm:gap-2 py-1 sm:py-0 px-0.5 sm:px-0 shrink-0">
            {/* Pulsante AIUTO (Desktop/Tablet: a sinistra di giorno/notte) */}
            {onOpenHelp && (
              <button
                onClick={onOpenHelp}
                className="hidden sm:flex p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-bold items-center gap-1.5 transition-colors shrink-0 bg-blue-50/50 dark:bg-blue-950/30 cursor-pointer shadow-2xs"
                title="Guida & Aiuto: Spiegazione del funzionamento del sito"
              >
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Aiuto</span>
              </button>
            )}

            {/* Theme Toggle Button (Desktop/Tablet) */}
            <button
              onClick={onToggleTheme}
              className="hidden sm:flex p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              title={theme === "dark" ? "Passa alla Modalità Giorno" : "Passa alla Modalità Notte"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden xl:inline">Giorno</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="hidden xl:inline">Notte</span>
                </>
              )}
            </button>

            {!hasShifts && (
              <button
                onClick={onGenerateSampleData}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Carica turni di prova"
              >
                Carica Esempi
              </button>
            )}

            {hasShifts && (
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer"
                title="Stampa ed Esporta Turni (PDF, CSV, Google Calendar, JSON)"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                <span className="hidden min-[360px]:inline">Stampa</span>
              </button>
            )}

            <button
              onClick={onOpenConfig}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer"
              title="Configurazione Tariffe e Contratto"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <span>Tariffe</span>
            </button>

            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-colors relative shrink-0 cursor-pointer rounded-xl ${
                  isCloudConnected
                    ? "text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 shadow-2xs font-bold"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                }`}
                title="Sincronizzazione Cloud (Cloudflare Worker)"
              >
                <Cloud className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isCloudConnected ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`} />
                <span>Cloud</span>
                {isCloudConnected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>
            )}

            <button
              onClick={onOpenAddShift}
              className="flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-colors shadow-xs shadow-blue-500/20 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden min-[360px]:inline">Nuovo </span>Turno
            </button>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        monthTitle={formattedMonth}
        onPrintPdf={onPrintReport}
        onExportCsv={onExportCsv}
        onExportGoogleCalendar={onExportGoogleCalendar || (() => {})}
        onExportJson={onExportJson || (() => {})}
        onImportJson={onImportJson}
      />
    </header>
  );
};
