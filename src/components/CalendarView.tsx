import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Shift, Expense, AppEvent } from '../types';
import {
  Plus,
  Moon,
  Clock,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
  TrendingUp,
  Briefcase,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';
import { checkDayTypeInfo } from '../utils/holidays';
import { COLOR_CLASSES } from './EventsSummaryCard';

interface CalendarViewProps {
  currentMonthKey: string; // YYYY-MM
  monthChangeTrigger?: number;
  shifts: Shift[];
  expenses?: Expense[];
  events?: AppEvent[];
  calendarContentMode?: 'shifts' | 'events';
  onToggleCalendarContentMode?: (mode: 'shifts' | 'events') => void;
  onSelectDate: (dateIso: string) => void;
  onSelectDateForEvent?: (dateIso: string) => void;
  onAddExpense: (dateIso: string) => void;
  onEditShift: (shift: Shift) => void;
  onEditExpense: (expense: Expense) => void;
  onEditEvent?: (event: AppEvent) => void;
  onMonthChange?: (monthKey: string) => void;
}

interface CalendarGridCell {
  type: 'empty' | 'day';
  id?: string;
  dayNumber?: number;
  dateIso?: string;
  dayShifts?: Shift[];
  dayExpenses?: Expense[];
  dayEvents?: AppEvent[];
  dayInfo?: { isSunday: boolean; isHoliday: boolean; holidayName?: string };
}

// Restituisce la stringa YYYY-MM-DD per il Lunedì della settimana contenente dateIso
function getMondayIso(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay(); // 0 = Domenica, 1 = Lunedì...
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().split('T')[0];
}

// Aggiunge N giorni a una data ISO YYYY-MM-DD in modo deterministico
function addDaysIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

// Formatta una data ISO per la visualizzazione in lingua italiana
function formatIsoForDisplay(dateIso: string, includeYear = false): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonthKey,
  monthChangeTrigger,
  shifts,
  expenses = [],
  events = [],
  calendarContentMode = 'shifts',
  onToggleCalendarContentMode,
  onSelectDate,
  onSelectDateForEvent,
  onAddExpense,
  onEditShift,
  onEditExpense,
  onEditEvent,
  onMonthChange,
}) => {
  // Modalità Vista: 'month' (Mensile) oppure 'week' (Settimanale) con persistenza in localStorage
  const [viewMode, setViewMode] = useState<'month' | 'week'>(() => {
    try {
      const saved = localStorage.getItem('calendar_view_mode');
      if (saved === 'month' || saved === 'week') return saved;
    } catch {
      // fallback
    }
    return 'month';
  });

  useEffect(() => {
    try {
      localStorage.setItem('calendar_view_mode', viewMode);
    } catch {
      // fallback
    }
  }, [viewMode]);

  // Gestione stato modalità bifunzione se non controllato dall'esterno
  const [internalContentMode, setInternalContentMode] = useState<'shifts' | 'events'>(calendarContentMode);

  useEffect(() => {
    setInternalContentMode(calendarContentMode);
  }, [calendarContentMode]);

  const activeContentMode = onToggleCalendarContentMode ? calendarContentMode : internalContentMode;

  const handleContentModeChange = (mode: 'shifts' | 'events') => {
    if (onToggleCalendarContentMode) {
      onToggleCalendarContentMode(mode);
    } else {
      setInternalContentMode(mode);
    }
  };

  // Mese & Anno correnti selezionati dall'header
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  // Data ISO del Lunedì della settimana attiva per la vista settimanale
  const [weekMondayIso, setWeekMondayIso] = useState<string>(() => {
    const todayIso = new Date().toISOString().split('T')[0];
    if (todayIso.startsWith(currentMonthKey)) {
      return getMondayIso(todayIso);
    }
    return getMondayIso(`${currentMonthKey}-01`);
  });

  // Ref per evitare che il cambio di mese provocato dalla navigazione settimanale resetti la settimana
  const isInternalNav = useRef(false);

  // Sincronizzazione quando l'utente seleziona un nuovo mese direttamente dall'header o il bottone Oggi
  useEffect(() => {
    if (isInternalNav.current) {
      isInternalNav.current = false;
      return;
    }
    const todayIso = new Date().toISOString().split('T')[0];
    if (todayIso.startsWith(currentMonthKey)) {
      setWeekMondayIso(getMondayIso(todayIso));
    } else {
      setWeekMondayIso(getMondayIso(`${currentMonthKey}-01`));
    }
  }, [currentMonthKey, monthChangeTrigger]);

  // Giorni del mese per la vista mensile
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Lunedì, 6 = Domenica

  // Mappe turni, spese ed eventi per rapida consultazione O(1)
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

  const eventMap = useMemo(() => {
    const map: Record<string, AppEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.data]) map[ev.data] = [];
      map[ev.data].push(ev);
    });
    // Ordina eventi del giorno per orario
    Object.keys(map).forEach((dateKey) => {
      map[dateKey].sort((a, b) => {
        if (a.tuttoIlGiorno && !b.tuttoIlGiorno) return -1;
        if (!a.tuttoIlGiorno && b.tuttoIlGiorno) return 1;
        return (a.oraInizio || '00:00').localeCompare(b.oraInizio || '00:00');
      });
    });
    return map;
  }, [events]);

  const weekDayNames = useMemo(() => ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], []);
  const weekDayFullNames = useMemo(() => ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'], []);

  // Griglia Mensile
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
        dayEvents: eventMap[dateIso] || [],
        dayInfo,
      });
    }
    return grid;
  }, [daysInMonth, firstDayOfWeek, yearStr, monthStr, shiftMap, expenseMap, eventMap]);

  // I 7 giorni della settimana corrente nella vista settimanale
  const weekDaysList = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dateIso = addDaysIso(weekMondayIso, i);
      const [y, m, d] = dateIso.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      const dayInfo = checkDayTypeInfo(dateIso);
      const monthNameShort = dateObj.toLocaleDateString('it-IT', { month: 'short', timeZone: 'UTC' });

      days.push({
        dateIso,
        dayNameShort: weekDayNames[i],
        dayNameFull: weekDayFullNames[i],
        dayNumber: d,
        monthNameShort,
        dayShifts: shiftMap[dateIso] || [],
        dayExpenses: expenseMap[dateIso] || [],
        dayEvents: eventMap[dateIso] || [],
        dayInfo,
      });
    }
    return days;
  }, [weekMondayIso, shiftMap, expenseMap, eventMap, weekDayNames, weekDayFullNames]);

  // Totali della Settimana per la vista settimanale
  const weekTotals = useMemo(() => {
    let oreLavorate = 0;
    let oreStraordinario = 0;
    let oreNotturne = 0;
    let guadagnoLordo = 0;
    let speseTotali = 0;
    let eventiTotali = 0;

    weekDaysList.forEach((day) => {
      day.dayShifts.forEach((s) => {
        oreLavorate += s.oreTotali || 0;
        oreStraordinario += s.oreSupplementari || 0;
        oreNotturne += s.oreNotturne || 0;
        guadagnoLordo += s.guadagnoTotaleLordo || 0;
      });
      day.dayExpenses.forEach((e) => {
        speseTotali += e.importo || 0;
      });
      eventiTotali += day.dayEvents.length;
    });

    return {
      oreLavorate,
      oreStraordinario,
      oreNotturne,
      guadagnoLordo: Math.round(guadagnoLordo),
      speseTotali: Math.round(speseTotali),
      eventiTotali,
    };
  }, [weekDaysList]);

  // Navigazione Settimane
  const handlePrevWeek = () => {
    isInternalNav.current = true;
    const newMonday = addDaysIso(weekMondayIso, -7);
    setWeekMondayIso(newMonday);

    const thursdayIso = addDaysIso(newMonday, 3);
    const newMonthKey = thursdayIso.substring(0, 7);
    if (newMonthKey !== currentMonthKey && onMonthChange) {
      onMonthChange(newMonthKey);
    }
  };

  const handleNextWeek = () => {
    isInternalNav.current = true;
    const newMonday = addDaysIso(weekMondayIso, 7);
    setWeekMondayIso(newMonday);

    const thursdayIso = addDaysIso(newMonday, 3);
    const newMonthKey = thursdayIso.substring(0, 7);
    if (newMonthKey !== currentMonthKey && onMonthChange) {
      onMonthChange(newMonthKey);
    }
  };

  const todayIso = new Date().toISOString().split('T')[0];

  // Titolo intervallo settimana (es. "12 Mag - 18 Mag 2026")
  const weekStartStr = formatIsoForDisplay(weekDaysList[0].dateIso);
  const weekEndStr = formatIsoForDisplay(weekDaysList[6].dateIso, true);

  const handleDayClick = (dateIso: string) => {
    if (activeContentMode === 'events' && onSelectDateForEvent) {
      onSelectDateForEvent(dateIso);
    } else {
      onSelectDate(dateIso);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 transition-colors">
      {/* Controlli Intestazione con Selettore Bifunzione (Turni vs Eventi) e Switcher Mese/Settimana */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-5 gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border transition-colors ${
              activeContentMode === 'events'
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
            }`}
          >
            {activeContentMode === 'events' ? (
              <CalendarIcon className="w-5 h-5 shrink-0" />
            ) : viewMode === 'month' ? (
              <Briefcase className="w-5 h-5 shrink-0" />
            ) : (
              <CalendarDays className="w-5 h-5 shrink-0" />
            )}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {activeContentMode === 'events' ? 'Calendario Eventi & Impegni' : 'Calendario Turni di Lavoro'}
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                ({viewMode === 'month' ? 'Vista Mese' : 'Vista Settimana'})
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeContentMode === 'events'
                ? 'Tocca un giorno per inserire o gestire appuntamenti ed eventi personali/lavorativi'
                : 'Tocca un giorno per registrare un turno di lavoro o ferie'}
            </p>
          </div>
        </div>

        {/* Toggles: Bi-Funzione (Turni / Eventi) & Vista (Mese / Settimana) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* SELETTORE BIFUNZIONE RICHIESTO: Turni vs Eventi */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleContentModeChange('shifts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeContentMode === 'shifts'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visualizza turni di lavoro, ore e guadagni"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Turni di lavoro</span>
            </button>
            <button
              onClick={() => handleContentModeChange('events')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeContentMode === 'events'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visualizza eventi, impegni e promemoria"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Eventi</span>
              {events.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              )}
            </button>
          </div>

          {/* Selettore Modalità Vista: Mese / Settimana */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Mese</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Settimana</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== VISTA SETTIMANALE ==================== */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {/* Navigazione Settimane e Totali Settimanali */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Pulsanti navigazione settimana */}
            <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 w-full md:w-auto">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
                title="Settimana precedente"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prec</span>
              </button>

              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 px-1 text-center whitespace-nowrap">
                {weekStartStr} - {weekEndStr}
              </span>

              <button
                onClick={handleNextWeek}
                className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
                title="Settimana successiva"
              >
                <span className="hidden sm:inline">Succ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Badge Riassuntivo della Settimana (adattato alla modalità attiva) */}
            {activeContentMode === 'shifts' ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Ore lavorate: <strong className="text-slate-900 dark:text-white">{weekTotals.oreLavorate}h</strong></span>
                </div>
                {weekTotals.oreStraordinario > 0 && (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span>Straord: <strong>+{weekTotals.oreStraordinario}h</strong></span>
                  </div>
                )}
                {weekTotals.oreNotturne > 0 && (
                  <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <Moon className="w-3 h-3" />
                    <span>Notte: <strong>{weekTotals.oreNotturne}h</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-extrabold text-xs sm:text-sm">+€{weekTotals.guadagnoLordo}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Eventi in questa settimana: <strong className="text-slate-900 dark:text-white">{weekTotals.eventiTotali}</strong></span>
                </div>
                {weekTotals.oreLavorate > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    <span>Turni previsti: <strong className="text-slate-700 dark:text-slate-300">{weekTotals.oreLavorate}h</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Intestazione Giorni della Settimana a Nuvoletta (stile vista mensile, solo desktop) */}
          <div className="hidden md:grid grid-cols-7 gap-3 sm:gap-2 mb-3 text-center">
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

          {/* Griglia a 7 Giorni della Settimana */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 sm:gap-2 items-stretch">
            {weekDaysList.map((day) => {
              const isToday = day.dateIso === todayIso;
              const isHoliday = day.dayInfo.isHoliday;
              const isSunday = day.dayInfo.isSunday;
              const hasShifts = day.dayShifts.length > 0;
              const hasExpenses = day.dayExpenses.length > 0;
              const hasEvents = day.dayEvents.length > 0;

              return (
                <div
                  key={day.dateIso}
                  onClick={() => handleDayClick(day.dateIso)}
                  className={`p-2 sm:p-2.5 lg:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group min-w-0 ${
                    isToday
                      ? activeContentMode === 'events'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 ring-2 ring-purple-400/30 shadow-xs'
                        : 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/50 ring-2 ring-blue-400/30 shadow-xs'
                      : isHoliday
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 hover:border-rose-300'
                      : (activeContentMode === 'events' ? hasEvents : hasShifts || hasExpenses)
                      ? 'border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 hover:border-purple-400'
                      : isSunday
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Testata Giorno Settimana */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0 shrink">
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 text-xs font-black flex items-center justify-center rounded-lg sm:rounded-xl shrink-0 ${
                            isToday
                              ? activeContentMode === 'events'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-blue-600 text-white shadow-xs'
                              : isHoliday
                              ? 'bg-rose-600 text-white shadow-xs'
                              : isSunday
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-extrabold'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-extrabold'
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                        <div className="min-w-0 md:hidden">
                          <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                            {day.dayNameShort}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize truncate">
                            {day.monthNameShort}
                          </div>
                        </div>
                      </div>

                      {/* Pulsanti Rapidi Aggiungi */}
                      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        {activeContentMode === 'events' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectDateForEvent) onSelectDateForEvent(day.dateIso);
                              else onSelectDate(day.dateIso);
                            }}
                            className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Aggiungi evento"
                          >
                            <Plus className="w-3.5 h-3.5 text-purple-600" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectDate(day.dateIso);
                              }}
                              className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Aggiungi turno"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddExpense(day.dateIso);
                              }}
                              className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Aggiungi spesa"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Festività */}
                    {isHoliday && day.dayInfo.holidayName && (
                      <div className="mb-2 px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-[10px] font-bold text-rose-800 dark:text-rose-300 truncate">
                        🎉 {day.dayInfo.holidayName}
                      </div>
                    )}

                    {/* SEZIONE CONTENUTO: Modalità EVENTI */}
                    {activeContentMode === 'events' ? (
                      <div className="space-y-1.5 min-h-[50px]">
                        {/* Eventi del Giorno */}
                        {day.dayEvents.map((ev) => {
                          const colorTheme = COLOR_CLASSES[ev.colore || 'blue'] || COLOR_CLASSES.blue;
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditEvent) onEditEvent(ev);
                              }}
                              className={`p-2 rounded-xl border shadow-2xs transition-all text-left cursor-pointer ${colorTheme.bg} ${colorTheme.border} hover:border-purple-400`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-black tracking-wide ${colorTheme.badge}`}>
                                  {ev.categoria}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                  {ev.tuttoIlGiorno ? 'Tutto il gg' : ev.oraInizio || ''}
                                </span>
                              </div>

                              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {ev.titolo}
                              </div>

                              {ev.luogo && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{ev.luogo}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Riferimento silenzioso ai turni di lavoro in visualizzazione eventi */}
                        {day.dayShifts.map((s) => (
                          <div
                            key={s.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditShift(s);
                            }}
                            className="p-1 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-[10px] font-semibold text-blue-900 dark:text-blue-200 flex items-center justify-between gap-1 cursor-pointer hover:border-blue-400"
                            title="Tocca per vedere il turno lavorativo"
                          >
                            <span className="flex items-center gap-1 truncate">
                              <Briefcase className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{s.orarioInizio}-{s.orarioFine}</span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              +€{Math.round(s.guadagnoTotaleLordo)}
                            </span>
                          </div>
                        ))}

                        {!hasEvents && !hasShifts && (
                          <div className="py-3 text-center text-[11px] font-medium text-slate-400 dark:text-slate-600">
                            Nessun impegno
                          </div>
                        )}
                      </div>
                    ) : (
                      /* SEZIONE CONTENUTO: Modalità TURNI DI LAVORO */
                      <div className="space-y-1.5 min-h-[50px]">
                        {/* Eventuale indicatore silenzioso di eventi in vista turni */}
                        {day.dayEvents.length > 0 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContentModeChange('events');
                            }}
                            className="p-1 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-[10px] font-bold text-purple-800 dark:text-purple-300 flex items-center justify-between gap-1 cursor-pointer hover:border-purple-400"
                            title="Tocca per passare alla vista eventi"
                          >
                            <span className="flex items-center gap-1 truncate">
                              <CalendarIcon className="w-3 h-3 text-purple-600 shrink-0" />
                              <span className="truncate">{day.dayEvents[0].titolo}</span>
                            </span>
                            {day.dayEvents.length > 1 && (
                              <span className="px-1 py-0.2 rounded bg-purple-200 dark:bg-purple-900 text-[9px]">
                                +{day.dayEvents.length - 1}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Lista Turni del Giorno */}
                        {day.dayShifts.map((s) => {
                          const isFerie = s.tipoGiorno === 'ferie' || s.isFerie;
                          return (
                            <div
                              key={s.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditShift(s);
                              }}
                              className={`p-2 rounded-xl border shadow-2xs transition-all text-left cursor-pointer ${
                                isFerie
                                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 hover:border-amber-400'
                                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                              }`}
                            >
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {isFerie ? (
                                  <span>🏖️ Ferie ({s.oreTotali}h)</span>
                                ) : (
                                  <span>{s.orarioInizio}-{s.orarioFine}</span>
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
                                  {(s.tipoGiorno === 'domenica' || (isSunday && !isFerie)) && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/90 text-blue-950 dark:text-blue-200 font-bold text-[10px] sm:text-xs">
                                      Dom
                                    </span>
                                  )}
                                  {(s.tipoGiorno === 'festivo' || (isHoliday && !isFerie)) && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/90 text-rose-950 dark:text-rose-200 font-bold text-[10px] sm:text-xs">
                                      Festivo
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Spese */}
                        {day.dayExpenses.map((e) => (
                          <div
                            key={e.id}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onEditExpense(e);
                            }}
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] flex justify-between items-center gap-1 cursor-pointer hover:border-rose-400 transition-colors"
                          >
                            <span className="font-semibold text-rose-900 dark:text-rose-200 truncate">
                              {e.categoria}
                            </span>
                            <span className="font-bold text-rose-700 dark:text-rose-300">
                              -€{Math.round(e.importo)}
                            </span>
                          </div>
                        ))}

                        {!hasShifts && !hasExpenses && (
                          <div className="py-3 text-center text-[11px] font-medium text-slate-400 dark:text-slate-600">
                            Riposo
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== VISTA MENSILE ==================== */}
      {viewMode === 'month' && (
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-2 no-scrollbar">
          <div className="min-w-[700px] sm:min-w-0">
            {/* Intestazione Giorni della Settimana a Nuvoletta */}
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

            {/* Celle del calendario mensile */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-stretch">
              {calendarGrid.map((cell) => {
                if (cell.type === 'empty') {
                  return (
                    <div
                      key={cell.id}
                      className="min-h-[90px] sm:min-h-[115px] h-auto bg-slate-50/40 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200/60 dark:border-slate-800/60"
                    />
                  );
                }

                const dayInfo = cell.dayInfo || { isSunday: false, isHoliday: false, holidayName: undefined };
                const isToday = cell.dateIso === todayIso;
                const isHoliday = dayInfo.isHoliday;
                const isSunday = dayInfo.isSunday;
                const hasShifts = cell.dayShifts && cell.dayShifts.length > 0;
                const hasExpenses = cell.dayExpenses && cell.dayExpenses.length > 0;
                const hasEvents = cell.dayEvents && cell.dayEvents.length > 0;

                return (
                  <div
                    key={cell.dateIso}
                    onClick={() => handleDayClick(cell.dateIso!)}
                    title={isHoliday ? `Festività: ${dayInfo.holidayName}` : undefined}
                    className={`min-h-[90px] sm:min-h-[115px] h-auto p-1.5 sm:p-2.5 rounded-xl border cursor-pointer relative flex flex-col justify-between group min-w-0 transition-colors ${
                      isToday
                        ? activeContentMode === 'events'
                          ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/50 ring-2 ring-purple-400/30'
                          : 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/50 ring-2 ring-blue-400/30'
                        : isHoliday
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-700'
                        : (activeContentMode === 'events' ? hasEvents : hasShifts || hasExpenses)
                        ? 'border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700'
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
                              ? activeContentMode === 'events'
                                ? 'bg-purple-600 text-white font-bold shadow-xs'
                                : 'bg-blue-600 text-white font-bold shadow-xs'
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
                            title={`Festività: ${dayInfo.holidayName}`}
                          >
                            {dayInfo.holidayName}
                          </span>
                        )}
                      </div>

                      {/* Pulsanti Rapidi in Hover */}
                      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        {activeContentMode === 'events' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectDateForEvent) onSelectDateForEvent(cell.dateIso!);
                              else onSelectDate(cell.dateIso!);
                            }}
                            className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-slate-800 rounded-lg transition-colors block cursor-pointer"
                            title="Aggiungi evento"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                          </button>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>

                    {/* CORPO CELLA: Modalità EVENTI */}
                    {activeContentMode === 'events' ? (
                      <div className="space-y-1.5 mt-1">
                        {cell.dayEvents?.map((ev) => {
                          const colorTheme = COLOR_CLASSES[ev.colore || 'blue'] || COLOR_CLASSES.blue;
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditEvent) onEditEvent(ev);
                              }}
                              className={`p-1.5 rounded-lg border shadow-2xs transition-colors text-left min-w-0 cursor-pointer ${colorTheme.bg} ${colorTheme.border} hover:border-purple-400`}
                            >
                              <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                                <span className={`px-1 py-0.2 rounded text-[9px] uppercase font-black ${colorTheme.badge}`}>
                                  {ev.categoria}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 truncate">
                                  {ev.tuttoIlGiorno ? 'Tutto il gg' : ev.oraInizio || ''}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                                {ev.titolo}
                              </div>
                            </div>
                          );
                        })}

                        {/* Riferimento visivo discreto al turno di lavoro */}
                        {cell.dayShifts && cell.dayShifts.length > 0 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditShift(cell.dayShifts![0]);
                            }}
                            className="p-1 rounded-md bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 text-[10px] font-semibold text-blue-900 dark:text-blue-300 flex items-center justify-between gap-1 cursor-pointer hover:border-blue-400 truncate"
                            title="Tocca per vedere i dettagli del turno"
                          >
                            <span className="flex items-center gap-1 truncate">
                              <Briefcase className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{cell.dayShifts[0].orarioInizio}-{cell.dayShifts[0].orarioFine}</span>
                            </span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                              +€{Math.round(cell.dayShifts[0].guadagnoTotaleLordo)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* CORPO CELLA: Modalità TURNI DI LAVORO */
                      <div className="space-y-1.5 mt-1">
                        {/* Indicatore presenza eventi del giorno */}
                        {cell.dayEvents && cell.dayEvents.length > 0 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContentModeChange('events');
                            }}
                            className="p-1 rounded-md bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-900/60 text-[10px] font-bold text-purple-900 dark:text-purple-300 flex items-center justify-between gap-1 cursor-pointer hover:border-purple-400 truncate"
                            title="Tocca per vedere la scheda eventi"
                          >
                            <span className="flex items-center gap-1 truncate">
                              <CalendarIcon className="w-3 h-3 text-purple-600 shrink-0" />
                              <span className="truncate">{cell.dayEvents[0].titolo}</span>
                            </span>
                            {cell.dayEvents.length > 1 && (
                              <span className="px-1 py-0.2 rounded bg-purple-200 dark:bg-purple-900 text-[9px] font-black shrink-0">
                                +{cell.dayEvents.length - 1}
                              </span>
                            )}
                          </div>
                        )}

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

                        {/* Spese */}
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
