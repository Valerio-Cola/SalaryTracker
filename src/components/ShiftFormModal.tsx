import React, { useState, useEffect } from 'react';
import { Shift, ContractConfig, DayType, QuickTemplate } from '../types';
import { checkDayTypeInfo } from '../utils/holidays';
import { computeShiftData, checkShiftOverlap } from '../utils/calculator';
import { X, Calendar, Clock, AlertTriangle, Check, Info, Moon, Sun, Trash2, Palmtree, Briefcase } from 'lucide-react';

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
      : standardDailyHours
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
      setTipoGiorno(shiftToEdit.tipoGiorno);
      setNomeFestivita(shiftToEdit.nomeFestivita || '');
      setNote(shiftToEdit.note || '');
      setOreFerieCustom(shiftToEdit.oreTotali > 0 ? shiftToEdit.oreTotali : standardDailyHours);
    } else {
      const dateToUse = initialDate || getTodayIso();
      setEntryMode('turno');
      setDataGrezza(dateToUse);
      setOrarioInizio('');
      setOrarioFine('');
      setPausaMinuti(0);
      setNote('');
      setOreFerieCustom(standardDailyHours);

      const info = checkDayTypeInfo(dateToUse);
      setTipoGiorno(info.suggestedDayType);
      setNomeFestivita(info.holidayName || '');
    }
  }, [shiftToEdit, initialDate, isOpen, config.oreSettimanali]);

  // Gestione cambio data -> Auto rilevazione festività e domenica
  const handleDateChange = (newDate: string) => {
    setDataGrezza(newDate);
    if (entryMode === 'turno') {
      const info = checkDayTypeInfo(newDate);
      setTipoGiorno(info.suggestedDayType);
      setNomeFestivita(info.holidayName || '');
    }
  };

  // Cambio modalità tra Turno e Ferie
  const handleModeChange = (mode: 'turno' | 'ferie') => {
    setEntryMode(mode);
    if (mode === 'ferie') {
      setTipoGiorno('ferie');
      if (!note) setNote('Ferie / Permesso retribuito');
    } else {
      const info = checkDayTypeInfo(dataGrezza);
      setTipoGiorno(info.suggestedDayType);
      setNomeFestivita(info.holidayName || '');
      if (note === 'Ferie / Permesso retribuito') setNote('');
    }
  };

  // Applicazione rapida di un template
  const applyTemplate = (tpl: QuickTemplate) => {
    setEntryMode('turno');
    setOrarioInizio(tpl.orarioInizio);
    setOrarioFine(tpl.orarioFine);
    setPausaMinuti(tpl.pausaMinuti);
    if (tpl.note && !note) setNote(tpl.note);
  };

  if (!isOpen) return null;

  // Calcolo in tempo reale per l'anteprima
  const isOverlap = entryMode === 'turno' && checkShiftOverlap(
    allShifts,
    dataGrezza,
    orarioInizio,
    orarioFine,
    shiftToEdit?.id
  );

  const previewShift = computeShiftData(
    {
      id: shiftToEdit?.id,
      dataGrezza,
      orarioInizio: entryMode === 'ferie' ? '09:00' : orarioInizio,
      orarioFine: entryMode === 'ferie' ? '17:00' : orarioFine,
      pausaMinuti: entryMode === 'ferie' ? 0 : pausaMinuti,
      tipoGiorno: entryMode === 'ferie' ? 'ferie' : tipoGiorno,
      nomeFestivita: entryMode === 'ferie' ? undefined : nomeFestivita,
      note,
      isFerie: entryMode === 'ferie',
      oreTotaliCustom: entryMode === 'ferie' ? oreFerieCustom : undefined,
    },
    config,
    allShifts
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-colors">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {entryMode === 'ferie' ? (
              <Palmtree className="w-5 h-5 text-amber-400" />
            ) : (
              <Clock className="w-5 h-5 text-blue-400" />
            )}
            <div>
              <h2 className="text-lg font-bold">
                {shiftToEdit
                  ? entryMode === 'ferie' ? 'Modifica Giorno di Ferie' : 'Modifica Turno'
                  : entryMode === 'ferie' ? 'Registra Ferie / ROL' : 'Aggiungi Nuovo Turno'}
              </h2>
              <p className="text-xs text-slate-300">
                {entryMode === 'ferie'
                  ? 'Le ferie contano per il monte ore settimanale contrattuale'
                  : 'Inserisci gli orari per calcolare in automatico la paga'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selezione Modalità: Turno vs Ferie */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleModeChange('turno')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 transition-colors">
          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Data
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ore di Ferie / Permesso da accreditare nel giorno
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="24"
                    required
                    value={oreFerieCustom}
                    onChange={(e) => setOreFerieCustom(parseFloat(e.target.value) || 0)}
                    className="w-32 p-2.5 text-sm font-bold border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-amber-50/50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-center"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Ore</span>
                </div>

                {/* Quick hour buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setOreFerieCustom(standardDailyHours)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 transition-colors"
                  >
                    Contrattuale ({standardDailyHours}h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOreFerieCustom(4)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    4 Ore
                  </button>
                  <button
                    type="button"
                    onClick={() => setOreFerieCustom(6)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    6 Ore
                  </button>
                  <button
                    type="button"
                    onClick={() => setOreFerieCustom(8)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    8 Ore
                  </button>
                </div>
              </div>

              {/* Informazione Regola Ferie */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <Info className="w-4 h-4 shrink-0" />
                  Come funzionano le Ferie nel calcolo:
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/90">
                  • Retribuzione base: <strong>€{config.pagaBaseOraria.toFixed(2)}/ora</strong> (+€{(oreFerieCustom * config.pagaBaseOraria).toFixed(2)} lordo).
                  <br />
                  • <strong>Monte Ore Settimanale</strong>: Le <strong>{oreFerieCustom}h</strong> di ferie vengono conteggiate nel totale della settimana per completare la soglia contrattuale ({config.oreSettimanali}h). Gli ulteriori turni lavorati nella stessa settimana genereranno straordinari!
                </p>
              </div>
            </div>
          ) : (
            /* Sezione per TURNO DI LAVORO */
            <div className="space-y-4">
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

                {/* Badge Rilevamento automatico Ore Notturne (22:00-06:00) */}
                <div className="mt-1.5 text-[11px] rounded-lg p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-all">
                  {previewShift.oreNotturne > 0 ? (
                    <div className="text-indigo-900 dark:text-indigo-300 flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>Rilevate autonomamente ore notturne (22:00 - 06:00):</span>
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
                      <span>Fascia notturna (22:00 - 06:00): 0 ore (turno diurno)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Rapidi se presenti */}
              {templates.length > 0 && !shiftToEdit && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Oppure scegli un template rapido:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {tpl.titolo} ({tpl.orarioInizio}-{tpl.orarioFine})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pausa Non Retribuita */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pausa Non Retribuita
                </label>
                <select
                  value={pausaMinuti}
                  onChange={(e) => setPausaMinuti(Number(e.target.value))}
                  className="w-full p-2.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={0}>Nessuna pausa (0 min)</option>
                  <option value={15}>15 minuti</option>
                  <option value={30}>30 minuti (Standard)</option>
                  <option value={45}>45 minuti</option>
                  <option value={60}>1 ora (60 min)</option>
                </select>
              </div>

              {/* Avviso Festività automatica */}
              {nomeFestivita && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>
                    Rilevata festività: <strong>{nomeFestivita}</strong> (+Bonus Festivo attivo).
                  </span>
                </div>
              )}

              {/* Avviso Sovrapposizione Orari */}
              {isOverlap && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Attenzione: Un altro turno è già registrato a questa ora nello stesso giorno.</span>
                </div>
              )}
            </div>
          )}

          {/* Note opzionali */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Note (Opzionale)
            </label>
            <input
              type="text"
              placeholder={entryMode === 'ferie' ? 'es. Ferie estive, Permesso ROL' : 'es. Cassa, Chiusura, Cucina, ecc.'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Box Anteprima Calcolo in Tempo Reale */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2 border-b border-slate-800">
              <span>{entryMode === 'ferie' ? 'Riepilogo Ferie' : 'Riepilogo Calcolo Turno'}</span>
              <span className={entryMode === 'ferie' ? 'text-amber-400 font-bold' : 'text-blue-400 font-bold'}>
                {previewShift.oreTotali.toFixed(2)} {entryMode === 'ferie' ? 'ore ferie' : 'ore lavorate'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-400">Ore Notte (22-06)</div>
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

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {shiftToEdit && onDeleteShift ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questa registrazione?')) {
                    onDeleteShift(shiftToEdit.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Elimina
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
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
        </form>
      </div>
    </div>
  );
};

