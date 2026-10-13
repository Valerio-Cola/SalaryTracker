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
  const totalMaggiorazioniOrarieExtra = shifts.reduce((acc, curr) => acc + (curr.guadagnoMaggiorazioniOrarie || 0), 0);

  // Calcolo completo compensi, ratei e bonus per il mese
  const monthKey = currentMonthKey || (shifts.length > 0 ? shifts[0].dataGrezza.slice(0, 7) : '2026-09');
  const comp = calculateMonthlyCompensation(shifts, config, monthKey);

  // Calcolo saldo ferie globale (partendo dal turno più vecchio al più recente)
  const shiftsForFerie = allShifts.length > 0 ? allShifts : shifts;
  const ferie = calculateFerieBalance(shiftsForFerie, config);

  // Spese
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.importo, 0);
  const finalBalance = comp.totalNettoCompleto - totalExpenses;

  // Stima monte ore del mese (indicativamente 4.33 settimane * ore contrattuali se impostate)
  const hasContractHours = Boolean(config.oreSettimanali && config.oreSettimanali > 0);
  const targetOreMese = hasContractHours ? config.oreSettimanali * 4.33 : 0;
  const progressPercent = targetOreMese > 0 ? Math.min(100, Math.round((totalOre / targetOreMese) * 100)) : 0;

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
      </div>

      {/* 3 Main KPI Boxes: Busta Paga Lorda | Saldo Ferie | Uscite */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Box 1: Busta Paga Lorda */}
        <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide truncate">
                Busta Paga Lorda
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                € {comp.totalLordoCompleto.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Netto in tasca:</span>
            <span className="bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-md text-xs font-black">
              € {comp.totalNettoCompleto.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Box 2: Saldo Ferie */}
        <div className="flex flex-col justify-between bg-amber-50/80 dark:bg-amber-950/30 p-3.5 sm:p-4 rounded-xl border border-amber-200/90 dark:border-amber-900/50 h-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/20">
              <Palmtree className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide truncate">
                Saldo Ferie
              </div>
              <div className={`text-xl sm:text-2xl font-black leading-tight ${
                ferie.ferieResidue >= 0 ? 'text-amber-950 dark:text-amber-200' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {ferie.ferieResidue} <span className="text-sm font-semibold text-amber-900/90 dark:text-amber-300/80">{Math.abs(ferie.ferieResidue) === 1 ? 'giorno' : 'giorni'}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200/80 dark:border-amber-900/40 text-xs font-bold flex items-center justify-between">
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Godute:</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              {ferie.ferieGoduteTotali} {Math.abs(ferie.ferieGoduteTotali) === 1 ? 'giorno' : 'giorni'}
            </span>
          </div>
        </div>

        {/* Box 3: Uscite */}
        <div className="flex flex-col justify-between bg-rose-50/80 dark:bg-rose-950/30 p-3.5 sm:p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 h-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-rose-500/20">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide truncate">
                Uscite
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-800 dark:text-rose-300 leading-tight">
                - € {totalExpenses.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-rose-200/80 dark:border-rose-900/40 text-xs font-bold flex items-center justify-between">
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Rimanenza:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
              finalBalance >= 0
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
            }`}>
              € {finalBalance.toFixed(2)}
            </span>
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
                  <span>2. Ritenute stimate (~{config.aliquotaNettoStimata ?? 15}%):</span>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm gap-1">
          <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            Ore Totali: <strong className="text-slate-900 dark:text-white font-black">{totalOre.toFixed(2)} h</strong>
            {totalOreFerie > 0 && (
              <span className="text-xs font-normal text-slate-600 dark:text-slate-400">
                ({totalOreLavorate.toFixed(1)}h lavoro + <strong className="text-amber-700 dark:text-amber-300 font-bold">{totalOreFerie.toFixed(1)}h ferie</strong>)
              </span>
            )}
          </span>
          {hasContractHours && (
            <span className="text-slate-800 dark:text-slate-200 font-semibold">
              Obiettivo contrattuale (~{targetOreMese.toFixed(0)}h): {progressPercent}%
            </span>
          )}
        </div>
        {hasContractHours && (
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Grid delle maggiorazioni e dettagli */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Paga Base (inclusa quota ferie) */}
        <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Paga Base Oraria</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
            € {totalBase.toFixed(2)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            {totalOre.toFixed(1)}h {totalOreFerie > 0 ? `(incluso ${totalOreFerie.toFixed(1)}h ferie)` : ''} × €{config.pagaBaseOraria.toFixed(2)}/h
          </div>
        </div>

        {/* Bonus Notte */}
        <div className="p-3 sm:p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
          <div className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" /> Bonus Notturno
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-indigo-950 dark:text-indigo-100 mt-0.5">
            + € {totalNotteExtra.toFixed(2)}
          </div>
          <div className="text-xs text-indigo-900 dark:text-indigo-300 mt-1 font-semibold">
            {totalNotturne.toFixed(1)}h notturne
          </div>
        </div>

        {/* Bonus Festivo & Domenica */}
        <div className="p-3 sm:p-3.5 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/60">
          <div className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" /> Festivo / Domenica
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-950 dark:text-rose-100 mt-0.5">
            + € {totalFestivoExtra.toFixed(2)}
          </div>
          <div className="text-xs text-rose-900 dark:text-rose-300 mt-1 font-semibold">
            Festivi e domeniche
          </div>
        </div>

        {/* Bonus Straordinario */}
        <div className="p-3 sm:p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
          <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" /> Straordinari
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
            + € {totalSuppExtra.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-900 dark:text-emerald-300 mt-1 font-semibold">
            {totalSupplementari.toFixed(1)}h oltre soglia sett.
          </div>
        </div>

        {/* Maggiorazioni Orarie Personalizzate */}
        {totalMaggiorazioniOrarieExtra > 0 && (
          <div className="p-3 sm:p-3.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/60">
            <div className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" /> Maggiorazioni Extra
              </span>
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-100 mt-0.5">
              + € {totalMaggiorazioniOrarieExtra.toFixed(2)}
            </div>
            <div className="text-xs text-amber-900 dark:text-amber-300 mt-1 font-semibold">
              Indennità orarie extra
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
