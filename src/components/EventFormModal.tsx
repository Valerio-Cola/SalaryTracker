import React, { useState, useEffect, useRef } from 'react';
import { AppEvent, EventCategory, CustomEventCategory } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Check,
  Plus,
  Palette,
  Pipette,
  Smile,
  SlidersHorizontal,
} from 'lucide-react';
import {
  COLOR_PRESETS,
  POPULAR_CATEGORY_EMOJIS,
  BUILTIN_CATEGORIES,
  resolveEventColor,
  resolveCategoryInfo,
} from '../utils/eventTheme';
import { getStoredCustomCategories, saveStoredCustomCategories } from '../utils/storage';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AppEvent) => void;
  onDelete?: (eventId: string) => void;
  eventToEdit?: AppEvent | null;
  initialDate?: string; // YYYY-MM-DD
  customCategories?: CustomEventCategory[];
  onUpdateCustomCategories?: (categories: CustomEventCategory[]) => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  eventToEdit,
  initialDate,
  customCategories: externalCustomCategories,
  onUpdateCustomCategories,
}) => {
  const getTodayIso = () => new Date().toISOString().split('T')[0];

  // Categorie personalizzate (fallback a localStorage se non fornite da prop)
  const [customCategories, setCustomCategories] = useState<CustomEventCategory[]>(() => {
    return externalCustomCategories || getStoredCustomCategories();
  });

  useEffect(() => {
    if (externalCustomCategories) {
      setCustomCategories(externalCustomCategories);
    }
  }, [externalCustomCategories]);

  // Campi evento
  const [titolo, setTitolo] = useState('');
  const [data, setData] = useState(initialDate || getTodayIso());
  const [tuttoIlGiorno, setTuttoIlGiorno] = useState(false);
  const [oraInizio, setOraInizio] = useState('');
  const [oraFine, setOraFine] = useState('');
  const [categoria, setCategoria] = useState<EventCategory>('lavoro');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('💼');
  const [colore, setColore] = useState<string>('blue');
  const [customHex, setCustomHex] = useState<string>('#8b5cf6');
  const [luogo, setLuogo] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Stato per la creazione inline di una nuova categoria personalizzata
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏋️');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [catCreationError, setCatCreationError] = useState('');

  // Riferimento per il color picker nativo nascosto
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitolo(eventToEdit.titolo || '');
      setData(eventToEdit.data || initialDate || getTodayIso());
      setTuttoIlGiorno(!!eventToEdit.tuttoIlGiorno);
      setOraInizio(eventToEdit.oraInizio || '');
      setOraFine(eventToEdit.oraFine || '');
      setCategoria(eventToEdit.categoria || 'lavoro');
      const catInfo = resolveCategoryInfo(eventToEdit.categoria || 'lavoro', customCategories, eventToEdit.emoji);
      setSelectedEmoji(catInfo.emoji);
      const evColor = eventToEdit.colore || catInfo.defaultColor || 'blue';
      setColore(evColor);
      if (evColor.startsWith('#')) {
        setCustomHex(evColor);
      }
      setLuogo(eventToEdit.luogo || '');
      setNote(eventToEdit.note || '');
    } else {
      setTitolo('');
      setData(initialDate || getTodayIso());
      setTuttoIlGiorno(false);
      setOraInizio('');
      setOraFine('');
      setCategoria('lavoro');
      setSelectedEmoji('💼');
      setColore('blue');
      setLuogo('');
      setNote('');
    }
    setErrorMsg('');
    setIsCreatingCategory(false);
    setNewCatLabel('');
  }, [eventToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSelectCategory = (catId: EventCategory) => {
    setCategoria(catId);
    const info = resolveCategoryInfo(catId, customCategories);
    setSelectedEmoji(info.emoji);
    if (!eventToEdit) {
      setColore(info.defaultColor);
      if (info.defaultColor.startsWith('#')) {
        setCustomHex(info.defaultColor);
      }
    }
  };

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = newCatLabel.trim();
    if (!cleanLabel) {
      setCatCreationError('Inserisci un nome per la categoria.');
      return;
    }

    const catId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCategory: CustomEventCategory = {
      id: catId,
      label: cleanLabel,
      emoji: newCatEmoji || '📌',
      colore: newCatColor || '#8b5cf6',
      createdAt: Date.now(),
    };

    const updated = [...customCategories, newCategory];
    setCustomCategories(updated);
    saveStoredCustomCategories(updated);
    if (onUpdateCustomCategories) {
      onUpdateCustomCategories(updated);
    }

    // Seleziona subito la nuova categoria creata
    setCategoria(catId);
    setSelectedEmoji(newCategory.emoji);
    setColore(newCategory.colore || '#8b5cf6');
    if (newCategory.colore?.startsWith('#')) {
      setCustomHex(newCategory.colore);
    }

    // Reset form categoria
    setNewCatLabel('');
    setIsCreatingCategory(false);
    setCatCreationError('');
  };

  const handleDeleteCustomCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    if (confirm('Vuoi eliminare questa categoria personalizzata?')) {
      const updated = customCategories.filter((c) => c.id !== catId);
      setCustomCategories(updated);
      saveStoredCustomCategories(updated);
      if (onUpdateCustomCategories) {
        onUpdateCustomCategories(updated);
      }
      if (categoria === catId) {
        handleSelectCategory('lavoro');
      }
    }
  };

  // Colori personalizzati salvati dall'utente
  const [savedCustomColors, setSavedCustomColors] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('bk_saved_colors');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const handleSaveCustomColor = (colorHex: string) => {
    if (!colorHex || !colorHex.startsWith('#')) return;
    const cleanHex = colorHex.toLowerCase();
    if (!savedCustomColors.includes(cleanHex)) {
      const updated = [cleanHex, ...savedCustomColors].slice(0, 10);
      setSavedCustomColors(updated);
      try {
        localStorage.setItem('bk_saved_colors', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleDeleteCustomColor = (e: React.MouseEvent, colorHex: string) => {
    e.stopPropagation();
    const updated = savedCustomColors.filter((c) => c.toLowerCase() !== colorHex.toLowerCase());
    setSavedCustomColors(updated);
    try {
      localStorage.setItem('bk_saved_colors', JSON.stringify(updated));
    } catch {}
  };

  const handleCustomColorChange = (hexValue: string) => {
    let clean = hexValue.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    setCustomHex(clean);
    setColore(clean);
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

    if (colore.startsWith('#')) {
      handleSaveCustomColor(colore);
    }

    const newEvent: AppEvent = {
      id: eventToEdit ? eventToEdit.id : `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      titolo: titolo.trim(),
      data,
      tuttoIlGiorno,
      oraInizio: tuttoIlGiorno ? undefined : (oraInizio || undefined),
      oraFine: tuttoIlGiorno ? undefined : (oraFine || undefined),
      categoria,
      emoji: selectedEmoji,
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

  // Risolvi colore per l'anteprima
  const activeColorTheme = resolveEventColor(colore);
  const isCustomActive = colore.startsWith('#');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col max-h-[90vh] transition-colors animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal - Sticky con Gradiente Elegante */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/20 text-purple-400">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {eventToEdit ? 'Modifica Evento' : 'Nuovo Evento'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer"
            title="Chiudi"
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
              placeholder="Es. Visita medica, Riunione turni, Allenamento, Compleanno..."
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

          {/* ============================================================ */}
          {/* CATEGORIE (STANDARD + PERSONALIZZATE CON EMOJI)               */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Categoria & Simbolo Emoji
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingCategory ? 'Chiudi' : 'Nuova Categoria'}</span>
              </button>
            </div>

            {/* Pannello Creazione Categoria Personalizzata */}
            {isCreatingCategory && (
              <div className="mb-3 p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-purple-600" />
                    Crea Categoria Personalizzata
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {catCreationError && (
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                    {catCreationError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Nome Categoria
                    </label>
                    <input
                      type="text"
                      placeholder="Es. Palestra, Corsi, Cinema..."
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Emoji Simbolo
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        maxLength={4}
                        value={newCatEmoji}
                        onChange={(e) => setNewCatEmoji(e.target.value)}
                        className="w-14 px-2 py-1.5 text-center text-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-slate-400">oppure seleziona:</span>
                    </div>
                  </div>
                </div>

                {/* Griglia rapida di emoji popolari */}
                <div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    {POPULAR_CATEGORY_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCatEmoji(emoji)}
                        className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-transform hover:scale-120 cursor-pointer ${
                          newCatEmoji === emoji
                            ? 'bg-purple-200 dark:bg-purple-900 ring-2 ring-purple-500 scale-110'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selezione Colore per la Categoria */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Colore predefinito:
                    </span>
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-6 h-6 rounded-md cursor-pointer border border-slate-300 dark:border-slate-600 p-0"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-500">{newCatColor}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveNewCategory}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salva Categoria</span>
                  </button>
                </div>
              </div>
            )}

            {/* Griglia Categorie Built-in + Personalizzate */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {/* Categorie Built-in */}
              {BUILTIN_CATEGORIES.map((cat) => {
                const isSelected = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm shrink-0">{cat.defaultEmoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}

              {/* Categorie Personalizzate dall'Utente */}
              {customCategories.map((c) => {
                const isSelected = categoria === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCategory(c.id)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-1 border transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-sm shrink-0">{c.emoji}</span>
                      <span className="truncate">{c.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomCategory(e, c.id)}
                      className={`p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-opacity ${
                        isSelected ? 'text-white' : 'text-slate-400'
                      }`}
                      title="Elimina categoria"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SEZIONE COLOR PICKER INTERATTIVO (COLORI BASE + COLOR PICKER) */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Colore Evento & Color Picker
              </label>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                {colore.startsWith('#') ? colore : activeColorTheme.hex}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              {/* Barra dei colori predefiniti e salvati */}
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = colore === preset.id || colore.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setColore(preset.id)}
                      title={preset.name}
                      style={{ backgroundColor: preset.hex }}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white ${
                        isSelected
                          ? 'scale-125 ring-2 ring-offset-2 ring-purple-500 shadow-md'
                          : 'hover:scale-110 opacity-80'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}

                {/* Colori personalizzati salvati dall'utente */}
                {savedCustomColors.map((hex) => {
                  const isSelected = colore.toLowerCase() === hex.toLowerCase();
                  return (
                    <div key={hex} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleCustomColorChange(hex)}
                        title={`Colore salvato: ${hex}`}
                        style={{ backgroundColor: hex }}
                        className={`w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 transition-transform cursor-pointer flex items-center justify-center text-white ${
                          isSelected
                            ? 'scale-125 ring-2 ring-offset-2 ring-purple-500 shadow-md'
                            : 'hover:scale-110 opacity-90'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white drop-shadow-md" />}
                      </button>

                      {/* Tasto Rimuovi Colore Salvato in Hover */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomColor(e, hex)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Rimuovi questo colore dai salvati"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                {/* Tasto Color Picker Custom con Pipetta */}
                <div className="relative flex items-center">
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={customHex}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
                    title="Scegli qualsiasi colore personalizzato col Color Picker"
                  />
                  <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    style={{
                      background:
                        'conic-gradient(from 180deg at 50% 50%, #f43f5e 0deg, #f59e0b 60deg, #10b981 120deg, #06b6d4 180deg, #3b82f6 240deg, #a855f7 300deg, #f43f5e 360deg)',
                    }}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                    title="Apri Color Picker personalizzato (HEX)"
                  >
                    <Pipette className="w-3.5 h-3.5 text-white drop-shadow-md" />
                  </button>
                </div>
              </div>

              {/* Riquadro Dettaglio Colore Custom Selezionato & Salva / Rimuovi Colore */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                    style={{ backgroundColor: colore.startsWith('#') ? colore : activeColorTheme.hex }}
                  />
                  <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm">
                    {colore.startsWith('#') ? 'Colore personalizzato' : 'Colore della palette'}
                  </span>

                  {colore.startsWith('#') && (
                    savedCustomColors.includes(colore.toLowerCase()) ? (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomColor(e, colore)}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/80 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title="Rimuovi questo colore dai salvati"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Rimuovi dai Salvati</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveCustomColor(colore)}
                        className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/80 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title="Salva questo colore nella tua tavolozza"
                      >
                        <Plus className="w-3.5 h-3.5 text-purple-600" />
                        <span>Salva nei Miei Colori</span>
                      </button>
                    )
                  )}
                </div>

                {/* Input manuale codice HEX */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">HEX:</span>
                  <input
                    type="text"
                    maxLength={7}
                    value={colore.startsWith('#') ? colore : activeColorTheme.hex}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-20 px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="p-1 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Apri selettore colore"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
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
                placeholder="Es. Via Roma 10, Ambulatorio, Sede Aziendale, Zoom..."
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
              placeholder="Dettagli, documenti da portare, promemoria..."
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
