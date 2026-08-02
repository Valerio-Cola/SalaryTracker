import React from 'react';
import { Shift } from '../types';
import { Plus, Moon, Sun, Clock } from 'lucide-react';

interface CalendarViewProps {
  currentMonthKey: string; // YYYY-MM
  shifts: Shift[];
  onSelectDate: (dateIso: string) => void;
  onEditShift: (shift: Shift) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonthKey,
  shifts,
  onSelectDate,
  onEditShift,
}) => {
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  // Giorni del mese
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Lunedì, 6 = Domenica

  // Mappa dei turni per giorno (chiave: YYYY-MM-DD)
  const shiftMap: Record<string, Shift[]> = {};
  shifts.forEach((s) => {
    if (!shiftMap[s.dataGrezza]) shiftMap[s.dataGrezza] = [];
    shiftMap[s.dataGrezza].push(s);
  });

  const weekDayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const calendarGrid = [];
  // Celle vuote per i giorni del mese precedente
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarGrid.push({ type: 'empty', id: `empty-${i}` });
  }

  // Giorni del mese
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateIso = `${yearStr}-${monthStr}-${dayPadded}`;
    calendarGrid.push({
      type: 'day',
      dayNumber: d,
      dateIso,
      dayShifts: shiftMap[dateIso] || [],
    });
  }

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Calendario Turni Mensili
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Clicca su un giorno per aggiungere un turno
        </span>
      </div>

      {/* Intestazione Giorni della Settimana (Lun-Dom) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 text-center">
        {weekDayNames.map((w, idx) => (
          <div
            key={w}
            className={`text-xs font-bold py-1.5 rounded-lg ${
              idx >= 5 ? 'text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/40' : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Griglia Calendario */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarGrid.map((cell) => {
          if (cell.type === 'empty') {
            return (
              <div
                key={cell.id}
                className="min-h-[70px] sm:min-h-[85px] bg-slate-50/40 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200/50 dark:border-slate-800/60"
              />
            );
          }

          const isToday = cell.dateIso === todayIso;
          const hasShifts = cell.dayShifts && cell.dayShifts.length > 0;
          const dateObj = new Date(cell.dateIso + 'T00:00:00');
          const isSunday = dateObj.getDay() === 0;

          return (
            <div
              key={cell.dateIso}
              onClick={() => onSelectDate(cell.dateIso!)}
              className={`min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                isToday
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/40 ring-2 ring-blue-400/20'
                  : hasShifts
                  ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700'
                  : isSunday
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
              }`}
            >
              {/* Header Giorno */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : isSunday
                      ? 'text-blue-700 dark:text-blue-400 font-black'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(cell.dateIso!);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-all"
                  title="Aggiungi turno in questo giorno"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badge Turno/i */}
              <div className="space-y-1 mt-1">
                {cell.dayShifts?.map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditShift(s);
                    }}
                    className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-400 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-none">
                      <span>{s.orarioInizio}-{s.orarioFine}</span>
                      <span className="text-blue-700 dark:text-blue-400 font-black">+€{s.guadagnoTotaleLordo.toFixed(0)}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{s.oreTotali}h</span>
                      {s.oreNotturne > 0 && (
                        <span className="px-1 py-0.2 rounded-sm bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold flex items-center gap-0.5">
                          <Moon className="w-2.5 h-2.5" /> {s.oreNotturne}h
                        </span>
                      )}
                      {s.tipoGiorno === 'domenica' && (
                        <span className="px-1 py-0.2 rounded-sm bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 font-bold">Dom</span>
                      )}
                      {s.tipoGiorno === 'festivo' && (
                        <span className="px-1 py-0.2 rounded-sm bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 font-bold">Fest</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
