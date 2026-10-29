import React, { useState } from 'react';
import { AppEvent, EventCategory } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Briefcase,
  User,
  AlertCircle,
  HeartPulse,
  Sparkles,
  ShoppingBag,
  Users,
  Bookmark,
} from 'lucide-react';
import { COLOR_CLASSES } from './EventsSummaryCard';

interface EventsListProps {
  events: AppEvent[];
  onEditEvent: (event: AppEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenAddEvent: (dateIso?: string) => void;
  monthTitle: string;
  currentMonthKey: string;
}

const CATEGORY_FILTERS: { id: 'all' | EventCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Tutti', icon: Filter },
  { id: 'lavoro', label: 'Lavoro', icon: Briefcase },
  { id: 'personale', label: 'Personale', icon: User },
  { id: 'scadenza', label: 'Scadenze', icon: AlertCircle },
  { id: 'salute', label: 'Salute', icon: HeartPulse },
  { id: 'svago', label: 'Svago', icon: Sparkles },
  { id: 'commissione', label: 'Commissioni', icon: ShoppingBag },
  { id: 'famiglia', label: 'Famiglia', icon: Users },
  { id: 'altro', label: 'Altro', icon: Bookmark },
];

export const EventsList: React.FC<EventsListProps> = ({
  events,
  onEditEvent,
  onDeleteEvent,
  onOpenAddEvent,
  monthTitle,
  currentMonthKey,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | EventCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<'month' | 'all'>('month');

  const todayIso = new Date().toISOString().split('T')[0];

  // Filtra per ambito mese / tutti
  const scopedEvents = filterScope === 'month'
    ? events.filter((e) => e.data.startsWith(currentMonthKey))
    : events;

  // Filtra per categoria e testo
  const filteredEvents = scopedEvents
    .filter((e) => {
      if (selectedCategory !== 'all' && e.categoria !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.titolo.toLowerCase().includes(q);
        const matchesLocation = e.luogo ? e.luogo.toLowerCase().includes(q) : false;
        const matchesNote = e.note ? e.note.toLowerCase().includes(q) : false;
        return matchesTitle || matchesLocation || matchesNote;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      const timeA = a.oraInizio || '00:00';
      const timeB = b.oraInizio || '00:00';
      return timeA.localeCompare(timeB);
    });

  const getDaysDiffText = (dateIso: string) => {
    const [y1, m1, d1] = todayIso.split('-').map(Number);
    const [y2, m2, d2] = dateIso.split('-').map(Number);
    const diffDays = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Oggi!', className: 'bg-rose-500 text-white font-black' };
    if (diffDays === 1) return { text: 'Domani', className: 'bg-amber-500 text-white font-bold' };
    if (diffDays === -1) return { text: 'Ieri', className: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' };
    if (diffDays > 1 && diffDays <= 7) return { text: `Fra ${diffDays} gg`, className: 'bg-blue-600 text-white font-bold' };
    if (diffDays > 7) return { text: `Fra ${diffDays} gg`, className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold' };
    return { text: `${Math.abs(diffDays)} gg fa`, className: 'bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium' };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-5 transition-colors">
      {/* Intestazione */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📅</span> Elenco Eventi & Impegni
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filterScope === 'month' ? `Visualizzazione per ${monthTitle}` : 'Tutti gli eventi salvati'} ({filteredEvents.length} trovati)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterScope('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterScope === 'month'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Questo Mese
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tutti ({events.length})
            </button>
          </div>

          <button
            onClick={() => onOpenAddEvent(`${currentMonthKey}-01`)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Evento</span>
          </button>
        </div>
      </div>

      {/* Barra Ricerca & Filtri Categoria */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca evento per titolo, luogo o note..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Categorie orizzontali scorrevoli */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_FILTERS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista Eventi */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nessun evento trovato
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? 'Nessun evento corrisponde ai criteri di ricerca impostati.'
              : 'Non ci sono eventi in programma per questo periodo.'}
          </p>
          <button
            onClick={() => onOpenAddEvent(`${currentMonthKey}-01`)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crea il tuo primo evento
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredEvents.map((ev) => {
            const colorTheme = COLOR_CLASSES[ev.colore || 'blue'] || COLOR_CLASSES.blue;
            const diffInfo = getDaysDiffText(ev.data);
            const [y, m, d] = ev.data.split('-').map(Number);
            const dateObj = new Date(Date.UTC(y, m - 1, d));
            const dayOfWeek = dateObj.toLocaleDateString('it-IT', { weekday: 'short', timeZone: 'UTC' });
            const monthShort = dateObj.toLocaleDateString('it-IT', { month: 'short', timeZone: 'UTC' });

            return (
              <div
                key={ev.id}
                onClick={() => onEditEvent(ev)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group ${colorTheme.bg} ${colorTheme.border} hover:shadow-xs hover:border-purple-400`}
              >
                {/* Data e Dettagli */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Badge Data */}
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                      {dayOfWeek}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white leading-none mt-0.5">
                      {d}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 capitalize leading-none mt-0.5">
                      {monthShort}
                    </span>
                  </div>

                  {/* Informazioni evento */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {ev.titolo}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${colorTheme.badge}`}>
                        {ev.categoria}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${diffInfo.className}`}>
                        {diffInfo.text}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {ev.tuttoIlGiorno ? 'Tutto il giorno' : `${ev.oraInizio || '00:00'} ${ev.oraFine ? ` - ${ev.oraFine}` : ''}`}
                      </span>

                      {ev.luogo && (
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.luogo}</span>
                        </span>
                      )}
                    </div>

                    {ev.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                        &quot;{ev.note}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent(ev);
                    }}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
                    title="Modifica evento"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Confermi di voler eliminare l'evento "${ev.titolo}"?`)) {
                        onDeleteEvent(ev.id);
                      }
                    }}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
                    title="Elimina evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
