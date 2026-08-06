import React from 'react';
import {
  Calendar,
  Plus,
  Settings,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  currentMonthKey: string; // YYYY-MM
  onMonthChange: (monthKey: string) => void;
  onOpenAddShift: () => void;
  onOpenConfig: () => void;
  onOpenCloudSync?: () => void;
  onOpenPrivacy?: () => void;
  onExportCsv: () => void;
  onPrintReport: () => void;
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
  onExportCsv,
  onPrintReport,
  onGenerateSampleData,
  hasShifts,
  theme,
  onToggleTheme,
  isCloudConnected = false,
}) => {
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
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          {/* Logo e Titolo */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
                SK
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  Salary Tracker SK
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Calcolo Stipendio & Turni
                </p>
              </div>
            </div>

            {/* Pulsante mobile theme */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                onClick={onToggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                title={theme === 'dark' ? 'Modalità Giorno' : 'Modalità Notte'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Selettore Mese */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto transition-colors">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all"
              title="Mese precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="px-3 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 capitalize"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {formattedMonth}
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all"
              title="Mese successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Azioni Principali */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto pb-1 sm:pb-0">
            {/* Theme Toggle Button Desktop */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title={theme === 'dark' ? 'Passa alla Modalità Giorno' : 'Passa alla Modalità Notte'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">Giorno</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="hidden md:inline">Notte</span>
                </>
              )}
            </button>

            {!hasShifts && (
              <button
                onClick={onGenerateSampleData}
                className="px-3 py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
                title="Carica turni di prova"
              >
                Carica Esempi
              </button>
            )}

            {hasShifts && (
              <>
                <button
                  onClick={onExportCsv}
                  className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Esporta CSV per Excel"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="hidden md:inline">CSV</span>
                </button>

                <button
                  onClick={onPrintReport}
                  className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Stampa prospetto mensile"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="hidden md:inline">Stampa</span>
                </button>
              </>
            )}

            <button
              onClick={onOpenConfig}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Configurazione Tariffe e Contratto"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="hidden md:inline">Tariffe</span>
            </button>

            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors relative ${
                  isCloudConnected
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                title="Sincronizzazione Cloud (Cloudflare Worker)"
              >
                <Cloud className={`w-4 h-4 ${isCloudConnected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                <span className="hidden md:inline">Cloud</span>
                {isCloudConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            )}

            <button
              onClick={onOpenAddShift}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/10 flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nuovo Turno
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
