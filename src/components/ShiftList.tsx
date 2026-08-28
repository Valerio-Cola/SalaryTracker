import React, { useState } from 'react';
import { Shift } from '../types';
import { Edit2, Trash2, Calendar, Moon, Sun, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface ShiftListProps {
  shifts: Shift[];
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onOpenAddShift: () => void;
  monthTitle: string;
}

export const ShiftList: React.FC<ShiftListProps> = ({
  shifts,
  onEditShift,
  onDeleteShift,
  onOpenAddShift,
  monthTitle,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Ordina i turni in modo decrescente (dal più recente al meno recente)
  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(b.dataGrezza).getTime() - new Date(a.dataGrezza).getTime()
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (shifts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center space-y-3 transition-colors">
        <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nessun turno in {monthTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Non hai ancora inserito turni per questo mese. Aggiungi il tuo primo turno di lavoro per iniziare il calcolo dello stipendio.
          </p>
        </div>
        <button
          onClick={onOpenAddShift}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/10 transition-all inline-flex items-center gap-1.5 mt-2"
        >
          Aggiungi Turno Ora
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📋 Elenco Turni ({shifts.length})</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">Clicca su un turno per vedere il dettaglio bonus</span>
      </div>

      <div className="space-y-2.5">
        {sortedShifts.map((s) => {
          const isFerie = s.tipoGiorno === 'ferie' || s.isFerie;
          const isExpanded = expandedId === s.id;
          const dateObj = new Date(s.dataGrezza + 'T00:00:00');
          const dateFormatted = dateObj.toLocaleDateString('it-IT', {
            weekday: 'short',
            day: '2-digit',
            month: 'long',
          });

          return (
            <div
              key={s.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isFerie
                  ? isExpanded
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/30 shadow-xs'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/10 dark:bg-amber-950/20 hover:border-amber-300'
                  : isExpanded
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
              }`}
            >
              {/* Main Card Header */}
              <div
                onClick={() => toggleExpand(s.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl font-bold flex flex-col items-center justify-center shrink-0 border text-center leading-tight ${
                    isFerie
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                      : 'bg-blue-50 dark:bg-slate-800 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-slate-700'
                  }`}>
                    <span className="text-xs">{dateObj.getDate()}</span>
                    <span className="text-[9px] uppercase font-semibold">
                      {dateObj.toLocaleDateString('it-IT', { month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {dateFormatted}
                      </span>
                      {isFerie && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                          🏖️ Ferie / ROL
                        </span>
                      )}
                      {!isFerie && s.tipoGiorno === 'domenica' && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 text-[10px] font-bold">
                          Domenica
                        </span>
                      )}
                      {!isFerie && s.tipoGiorno === 'festivo' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 text-[10px] font-bold">
                          {s.nomeFestivita || 'Festività'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      {isFerie ? (
                        <span className="font-semibold text-amber-800 dark:text-amber-300">
                          {s.oreTotali.toFixed(2)} h di ferie retribuite
                        </span>
                      ) : (
                        <>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {s.orarioInizio} - {s.orarioFine}
                          </span>
                          <span>•</span>
                          <span>{s.oreTotali.toFixed(2)} h lavorate</span>
                          {s.pausaMinuti > 0 && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">({s.pausaMinuti}m pausa)</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guadagno e Azioni */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      + € {s.guadagnoTotaleLordo.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      Netto ~€ {s.guadagnoTotaleNettoStimato.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditShift(s);
                      }}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={isFerie ? "Modifica ferie" : "Modifica turno"}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(isFerie ? 'Sei sicuro di voler eliminare questa registrazione di ferie?' : 'Sei sicuro di voler eliminare questo turno?')) {
                          onDeleteShift(s.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={isFerie ? "Elimina ferie" : "Elimina turno"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-slate-400 dark:text-slate-500 pl-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dettaglio Espanso del Turno o Ferie */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  {isFerie ? (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>🏖️ Dettaglio Giorno di Ferie:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        • Retribuzione Base: <strong>{s.oreTotali}h × paga oraria = €{s.guadagnoBase.toFixed(2)} lordo</strong>.
                        <br />
                        • <strong>Monte Ore</strong>: Questa giornata copre {s.oreTotali} ore per il conteggio settimanale, agevolando lo scatto di straordinari nei turni lavorati nella stessa settimana.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px]">Paga Base</span>
                        <div className="font-bold text-slate-900 dark:text-white">€ {s.guadagnoBase.toFixed(2)}</div>
                      </div>

                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-indigo-700 dark:text-indigo-300 text-[10px] flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> Ore Notte (22-06)
                        </span>
                        <div className="font-bold text-indigo-950 dark:text-indigo-100">
                          {s.oreNotturne.toFixed(2)} h (+€{s.guadagnoNotturno.toFixed(2)})
                        </div>
                      </div>

                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-rose-700 dark:text-rose-300 text-[10px] flex items-center gap-1">
                          <Sun className="w-3 h-3 text-rose-500 dark:text-rose-400" /> Festivo/Domenica
                        </span>
                        <div className="font-bold text-rose-950 dark:text-rose-100">
                          + € {s.guadagnoFestivoDomenicale.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Straordinario
                        </span>
                        <div className="font-bold text-emerald-950 dark:text-emerald-100">
                          {s.oreSupplementari.toFixed(2)} h (+€{s.guadagnoSupplementare.toFixed(2)})
                        </div>
                      </div>
                    </div>
                  )}

                  {s.note && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Note: <strong>{s.note}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
