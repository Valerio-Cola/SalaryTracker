import React, { useState, useEffect } from 'react';
import { AppEvent, EventCategory } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Tag,
  Trash2,
  Briefcase,
  User,
  AlertCircle,
  HeartPulse,
  Sparkles,
  ShoppingBag,
  Users,
  Bookmark,
  Check,
} from 'lucide-react';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AppEvent) => void;
  onDelete?: (eventId: string) => void;
  eventToEdit?: AppEvent | null;
  initialDate?: string; // YYYY-MM-DD
}

const CATEGORY_OPTIONS: {
  id: EventCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultColor: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'cyan' | 'slate';
}[] = [
  { id: 'lavoro', label: 'Lavoro', icon: Briefcase, defaultColor: 'blue' },
  { id: 'personale', label: 'Personale', icon: User, defaultColor: 'indigo' },
  { id: 'scadenza', label: 'Scadenza', icon: AlertCircle, defaultColor: 'rose' },
  { id: 'salute', label: 'Salute', icon: HeartPulse, defaultColor: 'emerald' },
  { id: 'svago', label: 'Svago', icon: Sparkles, defaultColor: 'purple' },
  { id: 'commissione', label: 'Commissione', icon: ShoppingBag, defaultColor: 'amber' },
  { id: 'famiglia', label: 'Famiglia', icon: Users, defaultColor: 'cyan' },
  { id: 'altro', label: 'Altro', icon: Bookmark, defaultColor: 'slate' },
];

const COLOR_OPTIONS: {
  id: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'cyan' | 'slate';
  bgClass: string;
  borderClass: string;
  name: string;
}[] = [
  { id: 'blue', bgClass: 'bg-blue-500', borderClass: 'border-blue-600', name: 'Blu' },
  { id: 'indigo', bgClass: 'bg-indigo-500', borderClass: 'border-indigo-600', name: 'Indaco' },
  { id: 'emerald', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-600', name: 'Smeraldo' },
  { id: 'purple', bgClass: 'bg-purple-500', borderClass: 'border-purple-600', name: 'Viola' },
  { id: 'rose', bgClass: 'bg-rose-500', borderClass: 'border-rose-600', name: 'Rosa' },
  { id: 'amber', bgClass: 'bg-amber-500', borderClass: 'border-amber-600', name: 'Ambra' },
  { id: 'cyan', bgClass: 'bg-cyan-500', borderClass: 'border-cyan-600', name: 'Ciano' },
  { id: 'slate', bgClass: 'bg-slate-500', borderClass: 'border-slate-600', name: 'Neutro' },
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  eventToEdit,
  initialDate,
}) => {
  const getTodayIso = () => new Date().toISOString().split('T')[0];

  const [titolo, setTitolo] = useState('');
  const [data, setData] = useState(initialDate || getTodayIso());
  const [tuttoIlGiorno, setTuttoIlGiorno] = useState(false);
  const [oraInizio, setOraInizio] = useState('10:00');
  const [oraFine, setOraFine] = useState('11:00');
  const [categoria, setCategoria] = useState<EventCategory>('lavoro');
  const [colore, setColore] = useState<'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'cyan' | 'slate'>('blue');
  const [luogo, setLuogo] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setTitolo(eventToEdit.titolo || '');
      setData(eventToEdit.data || initialDate || getTodayIso());
      setTuttoIlGiorno(!!eventToEdit.tuttoIlGiorno);
      setOraInizio(eventToEdit.oraInizio || '10:00');
      setOraFine(eventToEdit.oraFine || '11:00');
      setCategoria(eventToEdit.categoria || 'lavoro');
      setColore(eventToEdit.colore || 'blue');
      setLuogo(eventToEdit.luogo || '');
      setNote(eventToEdit.note || '');
    } else {
      setTitolo('');
      setData(initialDate || getTodayIso());
      setTuttoIlGiorno(false);
      setOraInizio('10:00');
      setOraFine('11:00');
      setCategoria('lavoro');
      setColore('blue');
      setLuogo('');
      setNote('');
    }
    setErrorMsg('');
  }, [eventToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleCategorySelect = (catId: EventCategory) => {
    setCategoria(catId);
    const cat = CATEGORY_OPTIONS.find((c) => c.id === catId);
    if (cat && !eventToEdit) {
      setColore(cat.defaultColor);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim()) {
      setErrorMsg('Inserisci un titolo per l\'evento.');
      return;
    }
    if (!data) {
      setErrorMsg('Seleziona una data valida.');
      return;
    }

    const newEvent: AppEvent = {
      id: eventToEdit ? eventToEdit.id : `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      titolo: titolo.trim(),
      data,
      tuttoIlGiorno,
      oraInizio: tuttoIlGiorno ? undefined : oraInizio,
      oraFine: tuttoIlGiorno ? undefined : (oraFine || undefined),
      categoria,
      colore,
      luogo: luogo.trim() || undefined,
      note: note.trim() || undefined,
    };

    onSave(newEvent);
    onClose();
  };

  const handleDelete = () => {
    if (eventToEdit && onDelete) {
      if (confirm('Vuoi davvero cancellare questo evento?')) {
        onDelete(eventToEdit.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col max-h-[90vh] transition-colors animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {eventToEdit ? 'Modifica Evento' : 'Nuovo Evento'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aggiungi appuntamenti, impegni e scadenze personali o di lavoro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form id="event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white dark:bg-slate-900">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Titolo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Titolo dell&apos;Evento *
            </label>
            <input
              type="text"
              autoFocus
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Es. Visita medica, Riunione coi responsabili, Compleanno..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Data & Tutto il Giorno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Data *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={tuttoIlGiorno}
                  onChange={(e) => setTuttoIlGiorno(e.target.checked)}
                  className="w-4 h-4 rounded-md text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tutto il giorno
                </span>
              </label>
            </div>
          </div>

          {/* Orari (se non tutto il giorno) */}
          {!tuttoIlGiorno && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Orario Inizio
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={oraInizio}
                    onChange={(e) => setOraInizio(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Orario Fine (opzionale)
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={oraFine}
                    onChange={(e) => setOraFine(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colore Etichetta */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Colore Etichetta
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setColore(col.id)}
                  title={col.name}
                  className={`w-7 h-7 rounded-full ${col.bgClass} transition-transform cursor-pointer flex items-center justify-center ${
                    colore === col.id ? 'scale-125 ring-2 ring-offset-2 ring-purple-500 shadow-md' : 'hover:scale-110 opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Luogo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Luogo / Indirizzo (opzionale)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={luogo}
                onChange={(e) => setLuogo(e.target.value)}
                placeholder="Es. Via Roma 10, Ospedale, Zoom / Teams..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Note & Promemoria (opzionale)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dettagli, cose da portare, promemoria..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </form>

        {/* Footer Actions - Pinned at bottom of modal */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2.5">
          {eventToEdit && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Elimina</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              form="event-form"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{eventToEdit ? 'Salva Modifiche' : 'Crea Evento'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
