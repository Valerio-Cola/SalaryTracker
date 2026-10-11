import React, { useState } from 'react';
import { Shift, ContractConfig, Expense } from '../types';
import {
  DollarSign,
  Clock,
  Moon,
  Sun,
  TrendingUp,
  Coins,
  Info,
  ChevronDown,
  ChevronUp,
  Receipt,
  Palmtree,
  Sparkles,
} from 'lucide-react';
import { calculateMonthlyCompensation, calculateFerieBalance } from '../utils/calculator';

interface MonthSummaryCardProps {
  shifts: Shift[]; // Turni del mese corrente
  allShifts?: Shift[]; // Tutti i turni per il calcolo ferie dall'inizio
  expenses?: Expense[];
  config: ContractConfig;
  monthTitle: string;
  currentMonthKey?: string; // YYYY-MM
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
  shifts,
  allShifts = [],
  expenses = [],
  config,
  monthTitle,
  currentMonthKey = '',
}) => {
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  // Ore mese corrente
  const totalOre = shifts.reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalOreLavorate = shifts
    .filter((s) => s.tipoGiorno !== 'ferie' && !s.isFerie)
    .reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalOreFerie = shifts
    .filter((s) => s.tipoGiorno === 'ferie' || s.isFerie)
    .reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalFerieCountMese = shifts.filter((s) => s.tipoGiorno === 'ferie' || s.isFerie).length;

  const totalNotturne = shifts.reduce((acc, curr) => acc + curr.oreNotturne, 0);
  const totalSupplementari = shifts.reduce((acc, curr) => acc + curr.oreSupplementari, 0);

  const totalBase = shifts.reduce((acc, curr) => acc + curr.guadagnoBase, 0);
  const totalNotteExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoNotturno, 0);
  const totalFestivoExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoFestivoDomenicale, 0);
  const totalSuppExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoSupplementare, 0);

  // Calcolo completo compensi, ratei e bonus per il mese
  const monthKey = currentMonthKey || (shifts.length > 0 ? shifts[0].dataGrezza.slice(0, 7) : '2026-09');
  const comp = calculateMonthlyCompensation(shifts, config, monthKey);

  // Calcolo saldo ferie globale (partendo dal turno più vecchio al più recente)
  const shiftsForFerie = allShifts.length > 0 ? allShifts : shifts;
  const ferie = calculateFerieBalance(shiftsForFerie, config);

  // Spese
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.importo, 0);
  const finalBalance = comp.totalNettoCompleto - totalExpenses;

  // Stima monte ore del mese (indicativamente 4.33 settimane * ore contrattuali)
  const targetOreMese = (config.oreSettimanali || 24) * 4.33;
  const progressPercent = Math.min(100, Math.round((totalOre / targetOreMese) * 100));

  const totalShiftsTaxDeduction = comp.totalShiftsLordo * comp.taxRateDecimal;

  const hasAdditions =
    config.includeTredicesimaMensile ||
    config.includeQuattordicesimaMensile ||
    config.includeBonusRenzi ||
    config.includeBonusL207 ||
    comp.activeCustomAllowances.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-5 transition-colors">
      {/* Top Title & Main Earnings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Riepilogo Mensile
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white capitalize">
            {monthTitle}
          </h2>
          {config.nomeLavoratore && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dipendente: <strong className="text-slate-700 dark:text-slate-200">{config.nomeLavoratore}</strong>
              {config.nomeAzienda ? ` (${config.nomeAzienda})` : ''}
            </p>
          )}
        </div>

        {/* Big Earnings Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Busta Paga Lorda</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                € {comp.totalLordoCompleto.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span>Netto in tasca:</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.2 rounded-md">
                  € {comp.totalNettoCompleto.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50">
            <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 uppercase">Totale Uscite</div>
              <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 leading-tight">
                - € {totalExpenses.toFixed(2)}
              </div>
              <div className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${finalBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                <span>Rimanenza:</span>
                <span className={`px-1.5 py-0.2 rounded-md ${finalBalance >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'}`}>
                  € {finalBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saldo Ferie Widget */}
      <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Palmtree className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <span>Saldo Ferie Disponibili</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">
                (calcolato sui {ferie.mesiLavorati} mesi di attività)
              </span>
            </div>
            <div className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5">
              Maturate: <strong>+{ferie.ferieMaturateTotali} gg</strong> ({ferie.ferieMaturateMese} gg/m) • Godute totali: <strong>-{ferie.ferieGoduteTotali} gg</strong>
              {totalFerieCountMese > 0 && (
                <span className="ml-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  (di cui {totalFerieCountMese} gg in questo mese)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Ferie Residue</div>
            <div className={`text-xl font-black ${ferie.ferieResidue >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {ferie.ferieResidue} {Math.abs(ferie.ferieResidue) === 1 ? 'giorno' : 'giorni'}
            </div>
          </div>
        </div>
      </div>

      {/* Badges per Ratei Mensili, Bonus L.207/2024 e Bonus Fissi */}
      {hasAdditions && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" /> Voci e Integrazioni Busta Paga:
            </span>
            <button
              onClick={() => setShowCalculationDetails(!showCalculationDetails)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              {showCalculationDetails ? 'Nascondi Dettaglio Calcolo' : 'Come viene calcolato il Netto?'}
              {showCalculationDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SOMMA ART.1 C.4 L.207/24 */}
            {config.includeBonusL207 && comp.bonusL207Netto > 0 && (
              <span className="bg-amber-100/80 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800 font-bold text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                SOMMA ART.1 C.4 L.207/24: +€{comp.bonusL207Netto.toFixed(2)} NETTO (Esente tasse)
              </span>
            )}

            {/* Bonus Renzi */}
            {config.includeBonusRenzi && (
              <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800 font-semibold text-[11px]">
                Bonus Renzi: +€{comp.bonusRenziNetto.toFixed(2)} NETTO (non imponibile)
              </span>
            )}

            {/* 13ª */}
            {config.includeTredicesimaMensile && comp.is13ErogataNelMese && (
              <span className="bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
                {config.modalitaTredicesima === 'annuale' ? '13ª Annuale (Erogata):' : '13ª Mensile:'} +€{comp.lordo13.toFixed(2)} lordo
              </span>
            )}
            {config.includeTredicesimaMensile && !comp.is13ErogataNelMese && config.modalitaTredicesima === 'annuale' && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                Accantonamento 13ª (Erogazione a Dicembre)
              </span>
            )}

            {/* 14ª */}
            {config.includeQuattordicesimaMensile && comp.is14ErogataNelMese && (
              <span className="bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
                {config.modalitaQuattordicesima === 'annuale' ? '14ª Annuale (Erogata):' : '14ª Mensile:'} +€{comp.lordo14.toFixed(2)} lordo
              </span>
            )}
            {config.includeQuattordicesimaMensile && !comp.is14ErogataNelMese && config.modalitaQuattordicesima === 'annuale' && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                Accantonamento 14ª (Erogazione a Giugno)
              </span>
            )}

            {/* Voci personalizzate */}
            {comp.activeCustomAllowances.map((v) => (
              <span
                key={v.id}
                className="bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 font-semibold text-[11px]"
              >
                {v.nome}: +€{v.importo.toFixed(2)} {v.tassabile ? 'lordo' : 'netto esente'}
              </span>
            ))}
          </div>

          {/* Dettaglio Spiegazione Calcolo (Espandibile) */}
          {showCalculationDetails && (
            <div className="mt-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Spiegazione del Calcolo Busta Paga (Lordo vs Netto):
              </div>

              <ul className="space-y-1 font-mono text-[11px]">
                <li className="flex justify-between">
                  <span>1. Lordo turni lavorati ({totalOre.toFixed(1)}h):</span>
                  <span className="font-bold text-slate-900 dark:text-white">€ {comp.totalShiftsLordo.toFixed(2)}</span>
                </li>
                <li className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>2. Ritenute stimate (~{config.aliquotaNettoStimata || 15}%):</span>
                  <span>- € {totalShiftsTaxDeduction.toFixed(2)}</span>
                </li>
                <li className="flex justify-between text-slate-900 dark:text-white font-bold pt-0.5 border-t border-slate-100 dark:border-slate-800">
                  <span>= Netto base turni:</span>
                  <span>€ {comp.totalShiftsNetto.toFixed(2)}</span>
                </li>

                {comp.rateiNettoMensili > 0 && (
                  <li className="flex justify-between text-amber-700 dark:text-amber-400">
                    <span>+ Netto Ratei 13ª / 14ª erogati:</span>
                    <span>+ € {comp.rateiNettoMensili.toFixed(2)}</span>
                  </li>
                )}

                {config.includeBonusRenzi && (
                  <li className="flex justify-between text-teal-700 dark:text-teal-400 font-bold">
                    <span>+ Bonus Renzi (Trattamento Integrativo):</span>
                    <span>+ € {comp.bonusRenziNetto.toFixed(2)} (Netto non imponibile)</span>
                  </li>
                )}

                {config.includeBonusL207 && comp.bonusL207Netto > 0 && (
                  <li className="flex justify-between text-amber-800 dark:text-amber-300 font-bold">
                    <span>+ SOMMA ART.1 C.4 L.207/24 (Legge Bilancio 2025):</span>
                    <span>+ € {comp.bonusL207Netto.toFixed(2)} (Netto esente imposte/contributi)</span>
                  </li>
                )}

                {comp.vociNetteExtra > 0 && (
                  <li className="flex justify-between text-blue-700 dark:text-blue-400 font-bold">
                    <span>+ Voci e indennità personalizzate:</span>
                    <span>+ € {comp.vociNetteExtra.toFixed(2)}</span>
                  </li>
                )}

                <li className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold text-xs pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span>= Netto Totale Accreditato in Busta:</span>
                  <span>€ {comp.totalNettoCompleto.toFixed(2)}</span>
                </li>
              </ul>

              <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/40 rounded-lg text-[11px] text-blue-950 dark:text-blue-200 leading-relaxed font-sans">
                💡 <strong>Trasparenza Fiscale:</strong><br />
                Sia il <strong>Bonus Renzi (€98,63)</strong> sia il nuovo bonus <strong>SOMMA ART.1 C.4 L.207/24 (€{comp.bonusL207Netto.toFixed(2)})</strong> sono integrazioni previste per legge che non subiscono trattenute INPS o IRPEF. Vengono quindi aggiunte per intero al netto finale.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar target ore */}
      <div className="space-y-1.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-1">
          <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Ore Totali: <strong className="text-slate-900 dark:text-white">{totalOre.toFixed(2)} h</strong>
            {totalOreFerie > 0 && (
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                ({totalOreLavorate.toFixed(1)}h lavoro + <strong className="text-amber-600 dark:text-amber-400">{totalOreFerie.toFixed(1)}h ferie</strong>)
              </span>
            )}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Obiettivo contrattuale (~{targetOreMese.toFixed(0)}h): {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid delle maggiorazioni e dettagli */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Paga Base (inclusa quota ferie) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Paga Base Oraria</div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            € {totalBase.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {totalOre.toFixed(1)}h {totalOreFerie > 0 ? `(incluso ${totalOreFerie.toFixed(1)}h ferie)` : ''} × €{config.pagaBaseOraria.toFixed(2)}/h
          </div>
        </div>

        {/* Bonus Notte */}
        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
          <div className="text-[11px] font-medium text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Bonus Notturno
            </span>
          </div>
          <div className="text-base font-bold text-indigo-950 dark:text-indigo-100 mt-0.5">
            + € {totalNotteExtra.toFixed(2)}
          </div>
          <div className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-1">
            {totalNotturne.toFixed(1)}h notturne (22-06)
          </div>
        </div>

        {/* Bonus Festivo & Domenica */}
        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/60">
          <div className="text-[11px] font-medium text-rose-900 dark:text-rose-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Festivo / Domenica
            </span>
          </div>
          <div className="text-base font-bold text-rose-950 dark:text-rose-100 mt-0.5">
            + € {totalFestivoExtra.toFixed(2)}
          </div>
          <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-1">
            Maggiorazione festivi/domenica
          </div>
        </div>

        {/* Bonus Straordinario */}
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
          <div className="text-[11px] font-medium text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Straordinari
            </span>
          </div>
          <div className="text-base font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">
            + € {totalSuppExtra.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">
            {totalSupplementari.toFixed(1)}h oltre soglia sett.
          </div>
        </div>
      </div>
    </div>
  );
};
