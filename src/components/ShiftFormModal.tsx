import React, { useState, useEffect } from 'react';
import { Shift, ContractConfig, DayType, QuickTemplate } from '../types';
import { checkDayTypeInfo } from '../utils/holidays';
import { computeShiftData, checkShiftOverlap } from '../utils/calculator';
import { X, Calendar, Clock, AlertTriangle, Sparkles, Check, Info, Moon, Sun, Trash2 } from 'lucide-react';

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

  const [dataGrezza, setDataGrezza] = useState<string>(
    shiftToEdit?.dataGrezza || initialDate || getTodayIso()
  );
  const [orarioInizio, setOrarioInizio] = useState<string>(
    shiftToEdit?.orarioInizio || '18:30'
  );
  const [orarioFine, setOrarioFine] = useState<string>(
    shiftToEdit?.orarioFine || '01:30'
  );
  const [pausaMinuti, setPausaMinuti] = useState<number>(
    shiftToEdit?.pausaMinuti ?? 30
  );
  const [tipoGiorno, setTipoGiorno] = useState<DayType>(
    shiftToEdit?.tipoGiorno || 'feriale'
  );
  const [nomeFestivita, setNomeFestivita] = useState<string>(
    shiftToEdit?.nomeFestivita || ''
  );
  const [note, setNote] = useState<string>(shiftToEdit?.note || '');
  const [manualOverride, setManualOverride] = useState<boolean>(false);

  // Aggiorna data/stato all'apertura o modifica
  useEffect(() => {
    if (shiftToEdit) {
      setDataGrezza(shiftToEdit.dataGrezza);
      setOrarioInizio(shiftToEdit.orarioInizio);
      setOrarioFine(shiftToEdit.orarioFine);
      setPausaMinuti(shiftToEdit.pausaMinuti);
      setTipoGiorno(shiftToEdit.tipoGiorno);
      setNomeFestivita(shiftToEdit.nomeFestivita || '');
      setNote(shiftToEdit.note || '');
      setManualOverride(true);
    } else {
      const dateToUse = initialDate || getTodayIso();
      setDataGrezza(dateToUse);
      setOrarioInizio('18:30');
      setOrarioFine('01:30');
      setPausaMinuti(30);
      setNote('');
      setManualOverride(false);

      const info = checkDayTypeInfo(dateToUse);
      setTipoGiorno(info.suggestedDayType);
      setNomeFestivita(info.holidayName || '');
    }
  }, [shiftToEdit, initialDate, isOpen]);

  // Gestione cambio data -> Auto rilevazione festività e domenica in modo autonomo
  const handleDateChange = (newDate: string) => {
    setDataGrezza(newDate);
    const info = checkDayTypeInfo(newDate);
    setTipoGiorno(info.suggestedDayType);
    setNomeFestivita(info.holidayName || '');
    setManualOverride(false);
  };

  // Applicazione rapida di un template
  const applyTemplate = (tpl: QuickTemplate) => {
    setOrarioInizio(tpl.orarioInizio);
    setOrarioFine(tpl.orarioFine);
    setPausaMinuti(tpl.pausaMinuti);
    if (tpl.note && !note) setNote(tpl.note);
  };

  if (!isOpen) return null;

  // Calcolo in tempo reale per l'anteprima
  const isOverlap = checkShiftOverlap(
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
      orarioInizio,
      orarioFine,
      pausaMinuti,
      tipoGiorno,
      nomeFestivita,
      note,
    },
    config,
    allShifts
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverlap) {
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
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">
                {shiftToEdit ? 'Modifica Turno' : 'Aggiungi Nuovo Turno'}
              </h2>
              <p className="text-xs text-slate-300">
                Inserisci gli orari per calcolare in automatico la paga
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



        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 transition-colors">
          {/* Data Turno */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Data del Turno
            </label>
            <input
              type="date"
              required
              value={dataGrezza}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full p-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {/* Badge Rilevamento automatico Tipo Giorno */}
            <div className="mt-1.5 text-[11px] rounded-lg p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5 transition-all">
              {tipoGiorno === 'festivo' ? (
                <div className="text-rose-800 dark:text-rose-300 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Rilevata autonomamente: <strong>Festività Rossa ({nomeFestivita || 'Festivo'})</strong> (+Bonus Festivo)</span>
                </div>
              ) : tipoGiorno === 'domenica' ? (
                <div className="text-blue-900 dark:text-blue-300 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Rilevata autonomamente: <strong>Domenica</strong> (+Bonus Domenicale)</span>
                </div>
              ) : (
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Rilevato autonomamente: <strong>Giorno Feriale</strong> (Lun - Sab)</span>
                </div>
              )}
            </div>
          </div>

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
              ) : (
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Fascia notturna (22:00 - 06:00): 0 ore (turno diurno)</span>
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

          {/* Note opzionali */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Note (Opzionale)
            </label>
            <input
              type="text"
              placeholder="es. Cassa, Chiusura, Cucina, ecc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Box Anteprima Calcolo in Tempo Reale */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2 border-b border-slate-800">
              <span>Riepilogo Calcolo Turno</span>
              <span className="text-blue-400 font-bold">
                {previewShift.oreTotali.toFixed(2)} ore lavorate
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
                <div className="text-[10px] text-slate-400">Tipo Giorno</div>
                <div className="text-sm font-bold text-blue-300 capitalize">
                  {previewShift.tipoGiorno}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Guadagno Turno Lordo:</span>
                <div className="text-xl font-black text-blue-400">
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
                  if (confirm('Sei sicuro di voler eliminare questo turno?')) {
                    onDeleteShift(shiftToEdit.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Elimina Turno
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/10 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {shiftToEdit ? 'Salva Modifiche' : 'Aggiungi Turno'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
