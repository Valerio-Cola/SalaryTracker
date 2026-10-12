import React, { useState, useEffect } from 'react';
import { Shift, ContractConfig, DayType, QuickTemplate } from '../types';
import { checkDayTypeInfo } from '../utils/holidays';
import { computeShiftData, checkShiftOverlap } from '../utils/calculator';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  Info,
  Moon,
  Sun,
  Trash2,
  Palmtree,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface ShiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit: Shift | null;
  config: ContractConfig;
  allShifts: Shift[];
  templates: QuickTemplate[];
  onSaveShift: (shift: Shift) => void;
  onDeleteShift?: (shiftId: string) => void;
  initialDate?: string;
}

export const ShiftFormModal: React.FC<ShiftFormModalProps> = ({
  isOpen,
  onClose,
  shiftToEdit,
  config,
  allShifts,
  templates,
  onSaveShift,
  onDeleteShift,
  initialDate,
}) => {
  const getTodayIso = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const standardDailyHours = Number(((config.oreSettimanali || 24) / 5).toFixed(2));

  const [entryMode, setEntryMode] = useState<'turno' | 'ferie'>(
    shiftToEdit?.tipoGiorno === 'ferie' || shiftToEdit?.isFerie ? 'ferie' : 'turno'
  );

  const [dataGrezza, setDataGrezza] = useState<string>(
    shiftToEdit?.dataGrezza || initialDate || getTodayIso()
  );
  const [orarioInizio, setOrarioInizio] = useState<string>(
    shiftToEdit ? shiftToEdit.orarioInizio : ''
  );
  const [orarioFine, setOrarioFine] = useState<string>(
    shiftToEdit ? shiftToEdit.orarioFine : ''
  );
  const [pausaMinuti, setPausaMinuti] = useState<number>(
    shiftToEdit?.pausaMinuti ?? 0
  );
  const [tipoGiorno, setTipoGiorno] = useState<DayType>(
    shiftToEdit?.tipoGiorno || 'feriale'
  );
  const [nomeFestivita, setNomeFestivita] = useState<string>(
    shiftToEdit?.nomeFestivita || ''
  );
  const [note, setNote] = useState<string>(shiftToEdit?.note || '');
  const [oreFerieCustom, setOreFerieCustom] = useState<number>(
    shiftToEdit && (shiftToEdit.isFerie || shiftToEdit.tipoGiorno === 'ferie')
      ? shiftToEdit.oreTotali
      : 0
  );
  const [maggiorazioniAttive, setMaggiorazioniAttive] = useState<string[]>(
    shiftToEdit?.maggiorazioniOrarieAttive || []
  );

  // Aggiorna data/stato all'apertura o modifica
  useEffect(() => {
    if (shiftToEdit) {
      const isVacation = shiftToEdit.tipoGiorno === 'ferie' || !!shiftToEdit.isFerie;
      setEntryMode(isVacation ? 'ferie' : 'turno');
      setDataGrezza(shiftToEdit.dataGrezza);
      setOrarioInizio(shiftToEdit.orarioInizio || '');
      setOrarioFine(shiftToEdit.orarioFine || '');
      setPausaMinuti(shiftToEdit.pausaMinuti || 0);
      setMaggiorazioniAttive(shiftToEdit.maggiorazioniOrarieAttive || []);

      const dateInfo = checkDayTypeInfo(shiftToEdit.dataGrezza);
      if (isVacation) {
        setTipoGiorno('ferie');
        setNomeFestivita('');
      } else if (dateInfo.isHoliday) {
        setTipoGiorno('festivo');
        setNomeFestivita(dateInfo.holidayName || '');
      } else if (dateInfo.isSunday) {
        setTipoGiorno('domenica');
        setNomeFestivita('');
      } else if (shiftToEdit.tipoGiorno === 'festivo' && shiftToEdit.nomeFestivita && !shiftToEdit.nomeFestivita.toLowerCase().includes('ferragosto')) {
        setTipoGiorno('festivo');
        setNomeFestivita(shiftToEdit.nomeFestivita);
      } else {
        setTipoGiorno('feriale');
        setNomeFestivita('');
      }

      let noteVal = shiftToEdit.note || '';
      if (noteVal === 'Turno Ferragosto' && !shiftToEdit.dataGrezza.includes('-08-15')) {
        noteVal = 'Turno serale';
      }
      if (noteVal === 'Chiusura Domenicale' && !dateInfo.isSunday) {
        noteVal = 'Chiusura serale';
      }
      setNote(noteVal);
      setOreFerieCustom(shiftToEdit.oreTotali > 0 ? shiftToEdit.oreTotali : 0);
    } else {
      const dateToUse = initialDate || getTodayIso();
      setEntryMode('turno');
      setDataGrezza(dateToUse);
      setOrarioInizio('');
      setOrarioFine('');
      setPausaMinuti(0);
      setNote('');
      setOreFerieCustom(0);
      setMaggiorazioniAttive(
        (config.maggiorazioniOrariePersonalizzate || [])
          .filter((m) => m.applicaDefault)
          .map((m) => m.id)
      );

      const info = checkDayTypeInfo(dateToUse);
      setTipoGiorno(info.suggestedDayType);
      setNomeFestivita(info.holidayName || '');
    }
  }, [shiftToEdit, initialDate, isOpen, config.oreSettimanali, config.maggiorazioniOrariePersonalizzate]);

  const handleDateChange = (newDate: string) => {
    setDataGrezza(newDate);
    if (entryMode === 'turno') {
      const info = checkDayTypeInfo(newDate);
      setTipoGiorno(info.suggestedDayType);
      setNomeFestivita(info.holidayName || '');
    }
  };

  const handleModeChange = (mode: 'turno' | 'ferie') => {
    setEntryMode(mode);
    if (mode === 'ferie') {
      setTipoGiorno('ferie');
      setNomeFestivita('');
      setOrarioInizio('09:00');
      setOrarioFine('17:00');
      setPausaMinuti(0);
      if (!note) setNote('Giorno di Ferie / Permesso');
    } else {
      const info = checkDayTypeInfo(dataGrezza);
      setTipoGiorno(info.suggestedDayType);
      setNomeFestivita(info.holidayName || '');
      if (note === 'Giorno di Ferie / Permesso') setNote('');
      if (!shiftToEdit) {
        setOrarioInizio('');
        setOrarioFine('');
        setPausaMinuti(0);
      }
    }
  };

  const applyTemplate = (tpl: QuickTemplate) => {
    setOrarioInizio(tpl.orarioInizio);
    setOrarioFine(tpl.orarioFine);
    setPausaMinuti(tpl.pausaMinuti);
    if (tpl.note && (!note || note === 'Turno ordinario')) {
      setNote(tpl.note);
    }
  };

  if (!isOpen) return null;

  const isOverlap =
    entryMode === 'turno' &&
    orarioInizio &&
    orarioFine &&
    checkShiftOverlap(
      allShifts,
      dataGrezza,
      orarioInizio,
      orarioFine,
      shiftToEdit?.id
    );

  const previewShift: Shift = computeShiftData(
    {
      id: shiftToEdit ? shiftToEdit.id : `shift_${Date.now()}`,
      dataGrezza,
      orarioInizio: entryMode === 'ferie' ? '09:00' : orarioInizio,
      orarioFine: entryMode === 'ferie' ? '17:00' : orarioFine,
      pausaMinuti: entryMode === 'ferie' ? 0 : pausaMinuti,
      tipoGiorno: entryMode === 'ferie' ? 'ferie' : tipoGiorno,
      nomeFestivita: entryMode === 'ferie' ? undefined : nomeFestivita,
      note,
      isFerie: entryMode === 'ferie',
      oreTotaliCustom: entryMode === 'ferie' ? oreFerieCustom : undefined,
      maggiorazioniOrarieAttive: entryMode === 'ferie' ? [] : maggiorazioniAttive,
    },
    config,
    allShifts
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryMode === 'turno' && (!orarioInizio || !orarioFine)) {
      return;
    }
    if (entryMode === 'turno' && isOverlap) {
      if (
        !confirm(
          'Attenzione: questo turno si sovrappone a un altro turno esistente. Vuoi salvarlo comunque?'
        )
      ) {
        return;
      }
    }
    onSaveShift(previewShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header Modal - Sticky */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              entryMode === 'ferie' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {entryMode === 'ferie' ? (
                <Palmtree className="w-5 h-5 text-amber-400" />
              ) : (
                <Clock className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {shiftToEdit
                  ? entryMode === 'ferie' ? 'Modifica Giorno di Ferie' : 'Modifica Turno'
                  : entryMode === 'ferie' ? 'Registra Ferie / Permesso' : 'Aggiungi Nuovo Turno'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {entryMode === 'ferie'
                  ? 'Le ore di ferie contano nel monte ore settimanale contrattuale'
                  : 'Orari, pause e calcolo istantaneo di maggiorazioni'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selezione Modalità: Turno vs Ferie - Sticky */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleModeChange('turno')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                entryMode === 'turno'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Turno di Lavoro</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('ferie')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                entryMode === 'ferie'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palmtree className="w-4 h-4" />
              <span>Ferie / Permesso</span>
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <form
          id="shift-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white dark:bg-slate-900 transition-colors"
        >
          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Data Turno
            </label>
            <input
              type="date"
              required
              value={dataGrezza}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full p-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {/* Badge Rilevamento automatico Tipo Giorno per Turno */}
            {entryMode === 'turno' && (
              <div className="mt-1.5 text-[11px] rounded-lg p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5 transition-all">
                {tipoGiorno === 'festivo' ? (
                  <div className="text-rose-800 dark:text-rose-300 flex items-center gap-1.5 font-medium">
                    <Info className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Rilevata autonomamente: <strong>Festività Rossa ({nomeFestivita || 'Festivo'})</strong> (+Bonus Festivo)</span>
                  </div>
                ) : tipoGiorno === 'domenica' ? (
                  <div className="text-blue-900 dark:text-blue-300 flex items-center gap-1.5 font-medium">
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Rilevata autonomamente: <strong>Domenica</strong> (+Bonus Domenicale)</span>
                  </div>
                ) : (
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Rilevato autonomamente: <strong>Giorno Feriale</strong> (Lun - Sab)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sezione SPECIFICA per FERIE */}
          {entryMode === 'ferie' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Inserisci quante ore di Ferie / Permesso accreditare:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative w-36">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      required
                      placeholder="es. 4.8 o 8"
                      value={oreFerieCustom || ''}
                      onChange={(e) => setOreFerieCustom(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 text-base font-extrabold border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-amber-50/50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-center"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Ore totali</span>
                </div>
              </div>

              {/* Informazione Regola Ferie Riformulata */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-850 rounded-xl text-xs text-amber-950 dark:text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                  <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  Come funzionano le Ferie nel calcolo:
                </div>
                <div className="text-[11px] leading-relaxed space-y-1.5 text-amber-900/90 dark:text-amber-200/90">
                  <p>
                    • <strong>Retribuzione oraria base:</strong> Le ore di ferie inserite vengono retribuite con la tua paga oraria ordinaria{config.pagaBaseOraria > 0 && oreFerieCustom > 0 ? ` (€${config.pagaBaseOraria.toFixed(2)}/h) per un totale di +€${(oreFerieCustom * config.pagaBaseOraria).toFixed(2)} lordo` : config.pagaBaseOraria > 0 ? ` (€${config.pagaBaseOraria.toFixed(2)}/h)` : ''}.
                  </p>
                  <p>
                    • <strong>Raggiungimento monte ore contrattuale:</strong> Le ore di assenza retribuita concorrono al completamento dell&apos;orario contrattuale della settimana. Eventuali ulteriori ore lavorate nella stessa settimana oltre la soglia genereranno automaticamente straordinario.
                  </p>
                  <p>
                    • <strong>Saldo Ferie Disponibili:</strong> Registrando questa giornata verrà scalato 1 giorno (o quota oraria corrispondente) dal contatore delle ferie maturate nel tuo riepilogo.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Sezione per TURNO DI LAVORO */
            <div className="space-y-4">
              
              {/* Preset Rapidi (Disponibili sia per nuovo turno che per modifica) */}
              {templates.length > 0 && (
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Applica Preset Rapido:
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      Personalizzabili in Tariffe
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {templates.map((tpl) => {
                      const isSelected = orarioInizio === tpl.orarioInizio && orarioFine === tpl.orarioFine && pausaMinuti === tpl.pausaMinuti;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => applyTemplate(tpl)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs scale-[1.02]'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50'
                          }`}
                        >
                          <span>{tpl.titolo}</span>
                          <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                            isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {tpl.orarioInizio}-{tpl.orarioFine}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Orario Inizio e Fine */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ora Inizio
                    </label>
                    <input
                      type="time"
                      required
                      value={orarioInizio}
                      onChange={(e) => setOrarioInizio(e.target.value)}
                      className="w-full p-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ora Fine
                    </label>
                    <input
                      type="time"
                      required
                      value={orarioFine}
                      onChange={(e) => setOrarioFine(e.target.value)}
                      className="w-full p-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Badge Rilevamento automatico Ore Notturne */}
                <div className="mt-1.5 text-[11px] rounded-lg p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-all">
                  {previewShift.oreNotturne > 0 ? (
                    <div className="text-indigo-900 dark:text-indigo-300 flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>Rilevate autonomamente ore notturne:</span>
                      </div>
                      <span className="font-extrabold text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded text-[10px]">
                        {previewShift.oreNotturne.toFixed(2)} h notturne
                      </span>
                    </div>
                  ) : (!orarioInizio || !orarioFine) ? (
                    <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Inserisci gli orari per calcolare durata e maggiorazioni</span>
                    </div>
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Fascia notturna: 0 ore (turno diurno)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pausa Non Retribuita */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pausa Non Retribuita
                </label>
                <select
                  value={pausaMinuti}
                  onChange={(e) => setPausaMinuti(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={0}>Nessuna pausa (0 min)</option>
                  <option value={15}>15 minuti di pausa</option>
                  <option value={30}>30 minuti di pausa</option>
                  <option value={45}>45 minuti di pausa</option>
                  <option value={60}>60 minuti (1 ora)</option>
                </select>
              </div>

              {/* Maggiorazioni Orarie Personalizzate per questo turno */}
              {config.maggiorazioniOrariePersonalizzate && config.maggiorazioniOrariePersonalizzate.length > 0 && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Maggiorazioni Orarie Applicabili
                    </label>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                      Tariffa oraria extra
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {config.maggiorazioniOrariePersonalizzate.map((m) => {
                      const isDefault = !!m.applicaDefault;
                      const isChecked = isDefault || maggiorazioniAttive.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-amber-100/80 dark:bg-amber-900/60 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDefault}
                              onChange={(e) => {
                                if (isDefault) return;
                                if (e.target.checked) {
                                  setMaggiorazioniAttive((prev) => [...prev, m.id]);
                                } else {
                                  setMaggiorazioniAttive((prev) => prev.filter((id) => id !== m.id));
                                }
                              }}
                              className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                            />
                            <span>{m.nome}</span>
                          </div>
                          <span className="font-mono text-[11px] text-amber-700 dark:text-amber-300 font-bold">
                            +{m.importoOrario.toFixed(2)} €/h
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note Opzionali */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note o Mansione (Opzionale)
            </label>
            <input
              type="text"
              placeholder="es. Chiusura cassa, Magazzino, Servizio serale..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Alert Sovrapposizione */}
          {isOverlap && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                Attenzione: Questo orario si sovrappone a un altro turno già salvato nella stessa data!
              </span>
            </div>
          )}

          {/* Anteprima Live Guadagno Turno */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{entryMode === 'ferie' ? 'Riepilogo Ferie' : 'Riepilogo Calcolo Turno'}</span>
              <span className={entryMode === 'ferie' ? 'text-amber-400 font-bold' : 'text-blue-400 font-bold'}>
                {previewShift.oreTotali.toFixed(2)} {entryMode === 'ferie' ? 'ore ferie' : 'ore lavorate'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-400">
                  Ore Notte{config.oraInizioNotte && config.oraFineNotte ? ` (${config.oraInizioNotte}-${config.oraFineNotte})` : ''}
                </div>
                <div className="text-sm font-bold text-indigo-300">
                  {previewShift.oreNotturne.toFixed(2)} h
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-400">Straordinario</div>
                <div className="text-sm font-bold text-emerald-300">
                  {previewShift.oreSupplementari.toFixed(2)} h
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-400">Tipo</div>
                <div className="text-sm font-bold text-amber-300 capitalize">
                  {previewShift.tipoGiorno === 'ferie' ? '🏖️ Ferie' : previewShift.tipoGiorno}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Retribuzione Lorda:</span>
                <div className={`text-xl font-black ${entryMode === 'ferie' ? 'text-amber-400' : 'text-blue-400'}`}>
                  + € {previewShift.guadagnoTotaleLordo.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Netto stimato (~{100 - config.aliquotaNettoStimata}%):</span>
                <div className="text-sm font-bold text-emerald-400">
                  ~ € {previewShift.guadagnoTotaleNettoStimato.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions - Sticky & Responsive */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2.5">
          {shiftToEdit && onDeleteShift ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Sei sicuro di voler eliminare questa registrazione?')) {
                  onDeleteShift(shiftToEdit.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Elimina
            </button>
          ) : <div />}

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
              form="shift-form"
              className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                entryMode === 'ferie'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
              }`}
            >
              <Check className="w-4 h-4" />
              {shiftToEdit
                ? 'Salva Modifiche'
                : entryMode === 'ferie'
                ? 'Registra Ferie'
                : 'Aggiungi Turno'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
