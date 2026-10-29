import React from 'react';
import { AppEvent, EventCategory, CustomEventCategory } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Briefcase,
  User,
  AlertCircle,
  HeartPulse,
  Sparkles,
  ShoppingBag,
  Users,
  Bookmark,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  CalendarCheck2,
  TrendingUp,
} from 'lucide-react';
import { resolveEventColor, resolveCategoryInfo } from '../utils/eventTheme';

interface EventsSummaryCardProps {
  events: AppEvent[]; // All events
  monthTitle: string;
  currentMonthKey: string; // YYYY-MM
  customCategories?: CustomEventCategory[];
  onOpenAddEvent: (dateIso?: string) => void;
  onEditEvent: (event: AppEvent) => void;
  onSwitchToShiftsView?: () => void;
}

// Mappatura icone categorie
const CATEGORY_ICON_MAP: Record<EventCategory, React.ComponentType<{ className?: string }>> = {
  lavoro: Briefcase,
  personale: User,
  scadenza: AlertCircle,
  salute: HeartPulse,
  svago: Sparkles,
  commissione: ShoppingBag,
  famiglia: Users,
  altro: Bookmark,
};

const CATEGORY_LABEL_MAP: Record<EventCategory, string> = {
  lavoro: 'Lavoro',
  personale: 'Personale',
  scadenza: 'Scadenza',
  salute: 'Salute',
  svago: 'Svago',
  commissione: 'Commissione',
  famiglia: 'Famiglia',
  altro: 'Altro',
};

// Mappatura colori per badge e bordi
export const COLOR_CLASSES: Record<
  string,
  { bg: string; text: string; border: string; badge: string; dot: string }
> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-900 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200',
    dot: 'bg-blue-500',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-900 dark:text-indigo-200',
    border: 'border-indigo-200 dark:border-indigo-800',
    badge: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200',
    dot: 'bg-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-900 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200',
    dot: 'bg-emerald-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-900 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200',
    dot: 'bg-purple-500',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-900 dark:text-rose-200',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200',
    dot: 'bg-rose-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-900 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-900 dark:text-cyan-200',
    border: 'border-cyan-200 dark:border-cyan-800',
    badge: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/60 dark:text-cyan-200',
    dot: 'bg-cyan-500',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-800/60',
    text: 'text-slate-900 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    dot: 'bg-slate-500',
  },
};

// Calcolo giorni di differenza
function getDaysDifference(targetDateIso: string, todayIso: string): number {
  const [y1, m1, d1] = todayIso.split('-').map(Number);
  const [y2, m2, d2] = targetDateIso.split('-').map(Number);
  const date1 = Date.UTC(y1, m1 - 1, d1);
  const date2 = Date.UTC(y2, m2 - 1, d2);
  const diffTime = date2 - date1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Formatta testo countdown amichevole
function getCountdownText(daysDiff: number): { text: string; badgeClass: string; isImminent: boolean } {
  if (daysDiff === 0) {
    return {
      text: 'Oggi!',
      badgeClass: 'bg-rose-500 text-white animate-pulse shadow-xs',
      isImminent: true,
    };
  }
  if (daysDiff === 1) {
    return {
      text: 'Domani',
      badgeClass: 'bg-amber-500 text-white shadow-xs',
      isImminent: true,
    };
  }
  if (daysDiff === 2) {
    return {
      text: 'Dopodomani (2 gg)',
      badgeClass: 'bg-indigo-500 text-white shadow-xs',
      isImminent: true,
    };
  }
  if (daysDiff > 2 && daysDiff <= 7) {
    return {
      text: `Fra ${daysDiff} giorni`,
      badgeClass: 'bg-blue-600 text-white shadow-xs',
      isImminent: true,
    };
  }
  if (daysDiff > 7) {
    return {
      text: `Fra ${daysDiff} giorni`,
      badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold',
      isImminent: false,
    };
  }
  return {
    text: `${Math.abs(daysDiff)} gg fa`,
    badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium',
    isImminent: false,
  };
}

// Formattazione data italiana (es. Mercoledì 14 Maggio 2026)
function formatItalianDate(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatItalianDateShort(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export const EventsSummaryCard: React.FC<EventsSummaryCardProps> = ({
  events,
  monthTitle,
  currentMonthKey,
  customCategories = [],
  onOpenAddEvent,
  onEditEvent,
  onSwitchToShiftsView,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];

  // Eventi del mese selezionato
  const currentMonthEvents = events.filter((e) => e.data.startsWith(currentMonthKey));

  // Tutti gli eventi futuri o di oggi, ordinati cronologicamente
  const upcomingEvents = events
    .filter((e) => e.data >= todayIso)
    .sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      const timeA = a.oraInizio || '00:00';
      const timeB = b.oraInizio || '00:00';
      return timeA.localeCompare(timeB);
    });

  // Il prossimo evento imminente
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const nextEventDaysDiff = nextEvent ? getDaysDifference(nextEvent.data, todayIso) : null;
  const nextEventCountdown = nextEventDaysDiff !== null ? getCountdownText(nextEventDaysDiff) : null;

  // Eventi nei prossimi 7 giorni
  const next7DaysIso = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();

  const eventsInNext7Days = events.filter((e) => e.data >= todayIso && e.data <= next7DaysIso);

  // Conteggio per categoria nel mese
  const categoryCounts = currentMonthEvents.reduce((acc, curr) => {
    acc[curr.categoria] = (acc[curr.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-5 transition-colors">
      {/* Top Header & Azioni */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Agenda & Eventi
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white capitalize">
            {monthTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchToShiftsView && (
            <button
              onClick={onSwitchToShiftsView}
              className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Passa al riepilogo calcolo busta paga"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Vedi Stipendio</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Main Highlight KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Box 1: Prossimo Evento in Arrivo (Highlight principale richiesto dall'utente) */}
        <div
          onClick={() => nextEvent && onEditEvent(nextEvent)}
          className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
            nextEvent
              ? 'bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 dark:from-purple-950/30 dark:via-slate-900 dark:to-indigo-950/20 border-purple-200 dark:border-purple-900/60 shadow-2xs hover:border-purple-400 cursor-pointer'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-purple-600" /> Prossimo Evento
              </span>
              {nextEventCountdown && (
                <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${nextEventCountdown.badgeClass}`}>
                  {nextEventCountdown.text}
                </span>
              )}
            </div>

            {nextEvent ? (
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {nextEvent.titolo}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
                  <span className="capitalize">{formatItalianDateShort(nextEvent.data)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {nextEvent.tuttoIlGiorno ? 'Tutto il giorno' : nextEvent.oraInizio + (nextEvent.oraFine ? ` - ${nextEvent.oraFine}` : '')}
                  </span>
                </div>

                {nextEvent.luogo && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium truncate pt-0.5">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{nextEvent.luogo}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-500 dark:text-slate-400">
                Nessun evento futuro in programma. Aggiungi il tuo primo impegno!
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Eventi nel Mese Selezionato */}
        <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 flex items-center justify-between">
              <span>Eventi Questo Mese</span>
              <CalendarCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {currentMonthEvents.length} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">impegni</span>
            </div>

            {/* Ripartizione categorie */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.keys(categoryCounts).length > 0 ? (
                Object.entries(categoryCounts).map(([catKey, count]) => {
                  const label = CATEGORY_LABEL_MAP[catKey as EventCategory] || catKey;
                  return (
                    <span
                      key={catKey}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      {label}: {count}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400 font-medium">Nessun evento salvato in questo mese</span>
              )}
            </div>
          </div>
        </div>

        {/* Box 3: Prossimi 7 Giorni (Lookahead) */}
        <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 flex items-center justify-between">
              <span>Prossimi 7 Giorni</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {eventsInNext7Days.length} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">in arrivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agenda Imminente: Mini strip con i prossimi 3-4 eventi in ordine cronologico */}
      {upcomingEvents.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              Prossimi Eventi in Agenda
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Mostrati i primi {Math.min(upcomingEvents.length, 4)} di {upcomingEvents.length} futuri
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {upcomingEvents.slice(0, 4).map((ev) => {
              const daysDiff = getDaysDifference(ev.data, todayIso);
              const countdown = getCountdownText(daysDiff);
              const colorTheme = resolveEventColor(ev.colore);
              const catInfo = resolveCategoryInfo(ev.categoria, customCategories, ev.emoji);

              return (
                <div
                  key={ev.id}
                  onClick={() => onEditEvent(ev)}
                  style={colorTheme.style}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${colorTheme.bg} ${colorTheme.border} hover:scale-[1.01] hover:shadow-2xs`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${countdown.badgeClass}`}>
                      {countdown.text}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                      {formatItalianDateShort(ev.data)}
                    </span>
                  </div>

                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {ev.titolo}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    <span className="flex items-center gap-1 truncate">
                      <span>{catInfo.emoji}</span>
                      <span className="truncate">{catInfo.label}</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                      {ev.tuttoIlGiorno ? 'Tutto il gg' : ev.oraInizio || ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
