import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface MonthPickerPopoverProps {
  currentMonthKey: string; // "YYYY-MM"
  onSelectMonth: (monthKey: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

const MONTH_SHORT = [
  'Gen',
  'Feb',
  'Mar',
  'Apr',
  'Mag',
  'Giu',
  'Lug',
  'Ago',
  'Set',
  'Ott',
  'Nov',
  'Dic',
];

export const MonthPickerPopover: React.FC<MonthPickerPopoverProps> = ({
  currentMonthKey,
  onSelectMonth,
  isOpen,
  onClose,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const [y] = currentMonthKey.split('-');
    return parseInt(y, 10) || new Date().getFullYear();
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Aggiorna l'anno visibile quando cambia currentMonthKey o quando si apre
  useEffect(() => {
    if (isOpen) {
      const [y] = currentMonthKey.split('-');
      setSelectedYear(parseInt(y, 10) || new Date().getFullYear());
    }
  }, [isOpen, currentMonthKey]);

  // Gestione click esterno per chiudere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const [currYearStr, currMonthStr] = currentMonthKey.split('-');
  const activeYear = parseInt(currYearStr, 10);
  const activeMonthIdx = parseInt(currMonthStr, 10) - 1;

  const today = new Date();
  const realTodayYear = today.getFullYear();
  const realTodayMonthIdx = today.getMonth();

  const handleSelect = (monthIdx: number) => {
    const mStr = String(monthIdx + 1).padStart(2, '0');
    onSelectMonth(`${selectedYear}-${mStr}`);
    onClose();
  };

  const handleSelectToday = () => {
    const y = realTodayYear;
    const mStr = String(realTodayMonthIdx + 1).padStart(2, '0');
    onSelectMonth(`${y}-${mStr}`);
    onClose();
  };

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 transition-all fade-in">
      <div ref={popoverRef}>
        {/* Header Calendario: Anno e Frecce */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Anno precedente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-base font-black text-slate-900 dark:text-white tracking-wide">
            {selectedYear}
          </span>

          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Anno successivo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Griglia 12 Mesi */}
        <div className="grid grid-cols-3 gap-2 my-2">
          {MONTH_SHORT.map((shortName, idx) => {
            const isSelected = selectedYear === activeYear && idx === activeMonthIdx;
            const isRealToday = selectedYear === realTodayYear && idx === realTodayMonthIdx;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                    : isRealToday
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={MONTH_NAMES[idx]}
              >
                <span>{shortName}</span>
                {isRealToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Quick Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-3 text-xs">
          <button
            onClick={handleSelectToday}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Mese Corrente
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
