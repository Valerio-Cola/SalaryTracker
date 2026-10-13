import React, { useMemo } from 'react';
import { Shift, Expense } from '../types';
import { Plus, Moon, Clock, Receipt } from 'lucide-react';
import { checkDayTypeInfo } from '../utils/holidays';

interface CalendarViewProps {
  currentMonthKey: string; // YYYY-MM
  shifts: Shift[];
  expenses?: Expense[];
  onSelectDate: (dateIso: string) => void;
  onAddExpense: (dateIso: string) => void;
  onEditShift: (shift: Shift) => void;
  onEditExpense: (expense: Expense) => void;
}

interface CalendarGridCell {
  type: 'empty' | 'day';
  id?: string;
  dayNumber?: number;
  dateIso?: string;
  dayShifts?: Shift[];
  dayExpenses?: Expense[];
  dayInfo?: { isSunday: boolean; isHoliday: boolean; holidayName?: string };
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonthKey,
  shifts,
  expenses = [],
  onSelectDate,
  onAddExpense,
  onEditShift,
  onEditExpense,
}) => {
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  // Giorni del mese
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Lunedì, 6 = Domenica

  // Mappa turni e spese (memoizzata per zero ricalcoli durante lo scroll)
  const shiftMap = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach((s) => {
      if (!map[s.dataGrezza]) map[s.dataGrezza] = [];
      map[s.dataGrezza].push(s);
    });
    return map;
  }, [shifts]);

  const expenseMap = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    expenses.forEach((e) => {
      if (!map[e.data]) map[e.data] = [];
      map[e.data].push(e);
    });
    return map;
  }, [expenses]);

  const weekDayNames = useMemo(() => ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], []);

  // Memoizzazione della griglia completa (inclusi i check festività)
  const calendarGrid = useMemo(() => {
    const grid: CalendarGridCell[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push({ type: 'empty', id: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPadded = String(d).padStart(2, '0');
      const dateIso = `${yearStr}-${monthStr}-${dayPadded}`;
      const dayInfo = checkDayTypeInfo(dateIso);

      grid.push({
        type: 'day',
        dayNumber: d,
        dateIso,
        dayShifts: shiftMap[dateIso] || [],
        dayExpenses: expenseMap[dateIso] || [],
        dayInfo,
      });
    }
    return grid;
  }, [daysInMonth, firstDayOfWeek, yearStr, monthStr, shiftMap, expenseMap]);

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" /> Calendario Mensile
        </h3>
        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Tocca un giorno per aggiungere un turno
        </span>
      </div>

      {/* Scorrimento orizzontale nativo al 100%, leggero e ultra-fluido (60/120fps senza lag o scia) */}
      <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-2 no-scrollbar">
        <div className="min-w-[700px] sm:min-w-0">
          {/* Intestazione Giorni della Settimana a Nuvoletta (Pill Chips morbide e leggere) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 text-center">
            {weekDayNames.map((w, idx) => (
              <div
                key={w}
                className={`text-xs sm:text-sm font-extrabold py-1.5 px-1 rounded-full transition-all border shadow-2xs ${
                  idx === 6
                    ? 'text-rose-800 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-900/60'
                    : idx === 5
                    ? 'text-blue-800 dark:text-blue-300 bg-blue-100/90 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-900/60'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Celle del calendario */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-stretch">
            {calendarGrid.map((cell) => {
              if (cell.type === 'empty') {
                return (
                  <div
                    key={cell.id}
                    className="min-h-[85px] sm:min-h-[105px] h-auto bg-slate-50/40 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200/60 dark:border-slate-800/60"
                  />
                );
              }

              const dayInfo = cell.dayInfo || { isSunday: false, isHoliday: false, holidayName: undefined };
              const isToday = cell.dateIso === todayIso;
              const isHoliday = dayInfo.isHoliday;
              const isSunday = dayInfo.isSunday;
              const hasShifts = cell.dayShifts && cell.dayShifts.length > 0;
              const hasExpenses = cell.dayExpenses && cell.dayExpenses.length > 0;

              return (
                <div
                  key={cell.dateIso}
                  onClick={() => onSelectDate(cell.dateIso!)}
                  title={isHoliday ? `Festività italiana: ${dayInfo.holidayName}` : undefined}
                  className={`min-h-[85px] sm:min-h-[105px] h-auto p-1.5 sm:p-2.5 rounded-xl border cursor-pointer relative flex flex-col justify-between group min-w-0 transition-colors ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/50 ring-2 ring-blue-400/30'
                      : isHoliday
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-700'
                      : hasShifts || hasExpenses
                      ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700'
                      : isSunday
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                      : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Header Giorno */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                      <span
                        className={`w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm font-black flex items-center justify-center rounded-lg shrink-0 ${
                          isToday && isHoliday
                            ? 'bg-rose-600 text-white font-black ring-2 ring-rose-400/30 shadow-xs'
                            : isToday
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : isHoliday
                            ? 'text-rose-900 dark:text-rose-100 font-black bg-rose-200 dark:bg-rose-950/90 ring-1 ring-rose-400 dark:ring-rose-800'
                            : isSunday
                            ? 'text-rose-800 dark:text-rose-300 font-black bg-rose-50 dark:bg-rose-950/40'
                            : 'text-slate-800 dark:text-slate-100 font-bold bg-slate-100/60 dark:bg-slate-800/60'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {isHoliday && dayInfo.holidayName && (
                        <span
                          className="text-[10px] sm:text-xs font-bold text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-900/60 rounded-md px-1.5 py-0.5 truncate max-w-[80px] hidden sm:inline-block"
                          title={`Festività Italiana: ${dayInfo.holidayName}`}
                        >
                          {dayInfo.holidayName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(cell.dateIso!);
                        }}
                        className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-slate-800 rounded-lg transition-colors block cursor-pointer"
                        title="Aggiungi turno"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddExpense(cell.dateIso!);
                        }}
                        className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Aggiungi spesa"
                      >
                        <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badge Turno/i o Ferie */}
                  <div className="space-y-1.5 mt-1">
                    {cell.dayShifts?.map((s) => {
                      const isFerie = s.tipoGiorno === 'ferie' || s.isFerie;
                      return (
                        <div
                          key={s.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditShift(s);
                          }}
                          className={`p-1.5 sm:p-2 rounded-xl border shadow-2xs transition-colors text-left min-w-0 ${
                            isFerie
                              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 hover:border-amber-400'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                          }`}
                        >
                          <div
                            className={`text-xs sm:text-sm font-bold leading-tight ${
                              isFerie
                                ? 'text-amber-950 dark:text-amber-200 flex items-center gap-1'
                                : 'text-slate-900 dark:text-slate-100 font-mono'
                            }`}
                          >
                            {isFerie ? (
                              <span>🏖️ Ferie ({s.oreTotali}h)</span>
                            ) : (
                              <span>
                                {s.orarioInizio}-{s.orarioFine}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-col gap-1 text-xs">
                            <span className="text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm">
                              +€{Math.round(s.guadagnoTotaleLordo)}
                            </span>

                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {!isFerie && (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-[10px] sm:text-xs">
                                  {s.oreTotali}h
                                </span>
                              )}
                              {s.oreSupplementari > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 font-bold text-[10px] sm:text-xs">
                                  {s.oreSupplementari}h straord.
                                </span>
                              )}
                              {s.oreNotturne > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-0.5 text-[10px] sm:text-xs">
                                  <Moon className="w-2.5 h-2.5" /> {s.oreNotturne}h notte
                                </span>
                              )}
                              {s.tipoGiorno === 'domenica' && (
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/90 text-blue-950 dark:text-blue-200 font-bold text-[10px] sm:text-xs">
                                  Dom
                                </span>
                              )}
                              {s.tipoGiorno === 'festivo' && (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/90 text-rose-950 dark:text-rose-200 font-bold text-[10px] sm:text-xs">
                                  Festivo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Badge Spese */}
                    {cell.dayExpenses?.map((e) => (
                      <div
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEditExpense(e);
                        }}
                        className="p-1.5 sm:p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 shadow-2xs hover:border-rose-400 transition-colors text-left min-w-0 flex justify-between items-center gap-1"
                      >
                        <div className="text-xs font-bold text-rose-900 dark:text-rose-200 truncate">
                          {e.categoria}
                        </div>
                        <div className="text-rose-800 dark:text-rose-300 font-black text-xs sm:text-sm whitespace-nowrap">
                          -€{Math.round(e.importo)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
