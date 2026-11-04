import React, { useState, useMemo } from 'react';
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
  X,
  HelpCircle,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { SurchargeIcon } from '../utils/surchargeIcons';
import {
  calculateMonthlyCompensation,
  calculateFerieBalance,
} from '../utils/calculator';

interface MonthSummaryCardProps {
  shifts: Shift[]; // Turni del mese corrente
  allShifts?: Shift[]; // Tutti i turni per il calcolo ferie dall'inizio
  expenses?: Expense[];
  config: ContractConfig;
  monthTitle: string;
  currentMonthKey?: string; // YYYY-MM
  onOpenConfig?: (targetSection?: string) => void;
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
  shifts,
  allShifts = [],
  expenses = [],
  config,
  monthTitle,
  currentMonthKey = '',
  onOpenConfig,
}) => {
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [showOvertimeInfo, setShowOvertimeInfo] = useState(false);

  const monthKey = currentMonthKey || (shifts.length > 0 ? shifts[0].dataGrezza.slice(0, 7) : '2026-09');

  // Ore mese corrente
  const totalOre = shifts.reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalOreLavorate = shifts
    .filter((s) => s.tipoGiorno !== 'ferie' && !s.isFerie)
    .reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalOreFerie = shifts
    .filter((s) => s.tipoGiorno === 'ferie' || s.isFerie)
    .reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalFerieCountMese = shifts.filter((s) => s.tipoGiorno === 'ferie' || s.isFerie).length;

  const oreNotturneMese = shifts.reduce((acc, curr) => acc + curr.oreNotturne, 0);
  const oreNotturneRiportate = shifts.reduce((acc, curr) => acc + (curr.oreNotturneRiportate || 0), 0);
  const totalNotturne = Number((oreNotturneMese + oreNotturneRiportate).toFixed(2));

  const oreSupplementariMese = shifts.reduce((acc, curr) => acc + curr.oreSupplementari, 0);
  const oreSupplementariRiportate = shifts.reduce((acc, curr) => acc + (curr.oreSupplementariRiportate || 0), 0);
  const totalSupplementari = Number((oreSupplementariMese + oreSupplementariRiportate).toFixed(2));
  const totalFestivoOre = shifts
    .filter((s) => (s.tipoGiorno === 'domenica' || s.tipoGiorno === 'festivo') && s.tipoGiorno !== 'ferie' && !s.isFerie)
    .reduce((acc, curr) => acc + curr.oreTotali, 0);

  const totalBase = shifts.reduce((acc, curr) => acc + curr.guadagnoBase, 0);
  const totalNotteExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoNotturno, 0);
  const totalFestivoExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoFestivoDomenicale, 0);
  const totalSuppExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoSupplementare, 0);
  const totalMaggiorazioniOrarieExtra = shifts.reduce((acc, curr) => acc + (curr.guadagnoMaggiorazioniOrarie || 0), 0);

  // Calcolo dettaglio individuale per ciascuna maggiorazione oraria personalizzata
  const customSurchargesBreakdown = useMemo(() => {
    if (!config.maggiorazioniOrariePersonalizzate || config.maggiorazioniOrariePersonalizzate.length === 0) {
      return [];
    }
    return config.maggiorazioniOrariePersonalizzate
      .map((m) => {
        const activeShifts = shifts.filter(
          (s) =>
            s.tipoGiorno !== 'ferie' &&
            !s.isFerie &&
            (m.applicaDefault || (s.maggiorazioniOrarieAttive && s.maggiorazioniOrarieAttive.includes(m.id)))
        );
        const ore = activeShifts.reduce((acc, curr) => acc + curr.oreTotali, 0);
        const importo = Number((ore * (m.importoOrario || 0)).toFixed(2));
        return {
          id: m.id,
          nome: m.nome,
          importoOrario: m.importoOrario,
          icona: m.icona,
          oreTotali: ore,
          totaleEuro: importo,
        };
      })
      .filter((item) => item.totaleEuro > 0 || item.oreTotali > 0);
  }, [config.maggiorazioniOrariePersonalizzate, shifts]);

  // Calcolo completo compensi, ratei e bonus per il mese
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

      {/* Grid delle maggiorazioni e dettagli (Tutti importi LORDI contrattuali) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Paga Base (inclusa quota ferie) */}
        <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                <Coins className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Paga Base Oraria</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/90 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                Lordo
              </span>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              € {totalBase.toFixed(2)}
            </div>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 font-bold text-right">
            {totalOre.toFixed(1)}h {totalOreFerie > 0 ? `(incluso ${totalOreFerie.toFixed(1)}h ferie)` : ''} × €{config.pagaBaseOraria.toFixed(2)}/h
          </div>
        </div>

        {/* Bonus Notte */}
        <div className="p-3 sm:p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 truncate">
                <Moon className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" />
                <span className="truncate">Bonus Notturno</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-200/80 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 shrink-0">
                Lordo
              </span>
            </div>
            <div className="text-lg sm:text-xl font-black text-indigo-950 dark:text-indigo-100 mt-1">
              € {totalNotteExtra.toFixed(2)}
            </div>
          </div>
          <div className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-300 mt-2 text-right">
            {oreNotturneRiportate > 0 ? (
              <span>
                {oreNotturneMese.toFixed(1)}h + {oreNotturneRiportate.toFixed(1)}h (Mese scorso)
              </span>
            ) : (
              `${totalNotturne.toFixed(1)}h`
            )}
          </div>
        </div>

        {/* Bonus Festivo & Domenica */}
        <div className="p-3 sm:p-3.5 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5 truncate">
                <Sun className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
                <span className="truncate">Festivo / Domenica</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 shrink-0">
                Lordo
              </span>
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-950 dark:text-rose-100 mt-1">
              € {totalFestivoExtra.toFixed(2)}
            </div>
          </div>
          <div className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-300 mt-2 text-right">
            {totalFestivoOre.toFixed(1)}h
          </div>
        </div>

        {/* Bonus Straordinario */}
        <div className="p-3 sm:p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 truncate">
                <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Straordinari</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 shrink-0">
                Lordo
              </span>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
              € {totalSuppExtra.toFixed(2)}
            </div>
          </div>
          <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 mt-2 text-right">
            {oreSupplementariRiportate > 0 ? (
              <span>
                {oreSupplementariMese.toFixed(1)}h + {oreSupplementariRiportate.toFixed(1)}h (Mese scorso)
              </span>
            ) : (
              `${totalSupplementari.toFixed(1)}h`
            )}
          </div>
        </div>

        {/* Maggiorazioni Orarie Personalizzate Individuali */}
        {customSurchargesBreakdown.length > 0 ? (
          customSurchargesBreakdown.map((item) => (
            <div
              key={item.id}
              className="p-3 sm:p-3.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 truncate">
                    <SurchargeIcon iconId={item.icona} className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span className="truncate">{item.nome}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 shrink-0">
                    Lordo
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-100 mt-1">
                  € {item.totaleEuro.toFixed(2)}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 mt-2 font-semibold text-right">
                {item.oreTotali.toFixed(1)}h × €{item.importoOrario.toFixed(2)}/h
              </div>
            </div>
          ))
        ) : totalMaggiorazioniOrarieExtra > 0 ? (
          <div className="p-3 sm:p-3.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 truncate">
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span className="truncate">Maggiorazioni Extra</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 shrink-0">
                  Lordo
                </span>
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-100 mt-1">
                € {totalMaggiorazioniOrarieExtra.toFixed(2)}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 mt-2 font-semibold text-right">
              Indennità orarie extra
            </div>
          </div>
        ) : null}
      </div>

      {/* Link esplicativi: Calcolo Netto e Settimane a cavallo */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 -mt-1 pt-1">
        <button
          type="button"
          onClick={() => setShowCalculationDetails(!showCalculationDetails)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer group py-1 px-2.5 rounded-lg border ${
            showCalculationDetails
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300'
              : 'border-transparent text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Mostra la formula e il dettaglio del passaggio da stipendio Lordo a Netto"
        >
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4 group-hover:decoration-blue-500">
            {showCalculationDetails ? 'Nascondi Calcolo Netto' : 'Come viene calcolato il Netto?'}
          </span>
          {showCalculationDetails ? <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={() => setShowOvertimeInfo(!showOvertimeInfo)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer group py-1 px-2.5 rounded-lg border ${
            showOvertimeInfo
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Clicca se noti turni, straordinari o notturni conteggiati diversamente a fine mese"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4 group-hover:decoration-emerald-500">
            Mancano dei Turni?
          </span>
          {showOvertimeInfo ? <ChevronUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Dettaglio Spiegazione Calcolo (Espandibile su richiesta dell'utente) */}
      {showCalculationDetails && (
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800/80 text-slate-700 dark:text-slate-300 space-y-3 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Spiegazione del Calcolo Busta Paga (Lordo vs Netto)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowCalculationDetails(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              title="Chiudi spiegazione calcolo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sezione 1: Turni e ritenute */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              1. Competenze Turni e Ritenute
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 space-y-2 border border-slate-100 dark:border-slate-800/60">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 pr-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug">
                    Lordo turni lavorati
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {totalOre.toFixed(1)}h totali (paga base + maggiorazioni)
                  </div>
                </div>
                <div className="shrink-0 text-right whitespace-nowrap pt-0.5">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    € {comp.totalShiftsLordo.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="min-w-0 pr-1">
                  <div className="font-semibold text-rose-600 dark:text-rose-400 text-xs leading-snug">
                    Ritenute stimate (~{config.aliquotaNettoStimata ?? 15}%)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    Trattenute previdenziali e fiscali stimate
                  </div>
                </div>
                <div className="shrink-0 text-right whitespace-nowrap pt-0.5">
                  <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                    - € {totalShiftsTaxDeduction.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2.5 pt-1.5 border-t border-slate-200/80 dark:border-slate-700 font-bold bg-white dark:bg-slate-800/80 -mx-1 px-2 py-1.5 rounded-md">
                <div className="min-w-0 pr-1">
                  <div className="text-slate-900 dark:text-white text-xs leading-snug">
                    = Netto base turni
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
                    Compenso turni al netto delle ritenute
                  </div>
                </div>
                <div className="shrink-0 text-right whitespace-nowrap pt-0.5">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    € {comp.totalShiftsNetto.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sezione 2: Ratei e Bonus Netti Esenti */}
          {(comp.rateiNettoMensili > 0 || config.includeBonusRenzi || (config.includeBonusL207 && comp.bonusL207Netto > 0) || comp.vociNetteExtra > 0) && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                2. Integrazioni e Bonus Esenti da Tasse
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 space-y-2 border border-slate-100 dark:border-slate-800/60">
                {comp.rateiNettoMensili > 0 && (
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 pr-1">
                      <div className="font-semibold text-amber-800 dark:text-amber-300 text-xs leading-snug">
                        + Netto Ratei 13ª / 14ª erogati
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        Lordo €{comp.rateiLordoMensili.toFixed(2)} al netto ritenute
                      </div>
                    </div>
                    <div className="shrink-0 text-right whitespace-nowrap pt-0.5">
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                        + € {comp.rateiNettoMensili.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {config.includeBonusRenzi && (
                  <div className="flex items-start justify-between gap-2.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="min-w-0 pr-1">
                      <div className="font-semibold text-teal-800 dark:text-teal-300 text-xs leading-snug">
                        + Bonus Renzi (DL 3/2020)
                      </div>
                      <div className="text-[10px] text-teal-700/90 dark:text-teal-400 leading-tight mt-0.5">
                        Trattamento integrativo • 100% Netto non imponibile
                      </div>
                    </div>
                    <div className="shrink-0 text-right whitespace-nowrap pt-0.5">
                      <span className="font-mono font-bold text-xs text-teal-700 dark:text-teal-400">
                        + € {comp.bonusRenziNetto.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {config.includeBonusL207 && comp.bonusL207Netto > 0 && (
                  <div className="flex items-start justify-between gap-2.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="min-w-0 pr-1">
                      <div className="font-semibold text-amber-900 dark:text-amber-200 text-xs leading-snug">
                        + SOMMA ART.1 C.4 L.207/24
                      </div>
                      <div className="text-[10px] text-amber-700/90 dark:text-amber-400 leading-tight mt-0.5">
                        Legge Bilancio 2025 • 100% Netto esente contributi e imposte
                      </div>
                    </div>
                    <div className="shrink-0 text-right whitespace-nowrap pt-0.5">
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                        + € {comp.bonusL207Netto.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {comp.vociNetteExtra > 0 && (
                  <div className="flex items-start justify-between gap-2.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="min-w-0 pr-1">
                      <div className="font-semibold text-blue-800 dark:text-blue-300 text-xs leading-snug">
                        + Voci e indennità personalizzate
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        Competenze nette aggiuntive
                      </div>
                    </div>
                    <div className="shrink-0 text-right whitespace-nowrap pt-0.5">
                      <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                        + € {comp.vociNetteExtra.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Risultato Finale: Box Netto Busta */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0 pr-1">
              <div className="font-black text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Netto Totale Accreditato</span>
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
                Importo stimato netto in busta paga
              </div>
            </div>
            <div className="shrink-0 text-right whitespace-nowrap">
              <span className="font-mono font-black text-sm sm:text-base text-emerald-700 dark:text-emerald-300">
                € {comp.totalNettoCompleto.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Box Trasparenza Fiscale */}
          <div className="p-2.5 sm:p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 text-[11px] text-blue-950 dark:text-blue-200 leading-relaxed font-sans">
            💡 <strong className="font-bold">Trasparenza Fiscale:</strong><br />
            Sia il <strong>Bonus Renzi (€{comp.bonusRenziNetto.toFixed(2)})</strong> sia il bonus <strong>SOMMA ART.1 C.4 L.207/24 (€{comp.bonusL207Netto.toFixed(2)})</strong> sono integrazioni previste per legge che non subiscono trattenute INPS o IRPEF. Vengono quindi aggiunti per intero direttamente al netto finale.
          </div>
        </div>
      )}

      {/* Box Spiegazione Straordinari & Settimana a cavallo di 2 mesi (aperto su click) */}
      {showOvertimeInfo && (
        <div className="p-4 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2.5 text-xs text-emerald-950 dark:text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-sm text-emerald-950 dark:text-emerald-100 pb-1.5 border-b border-emerald-200 dark:border-emerald-800">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Perché potresti trovare meno straordinari o notturni nel cedolino di questo mese?
            </span>
            <button
              type="button"
              onClick={() => setShowOvertimeInfo(false)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-100 p-0.5 rounded cursor-pointer"
              title="Chiudi spiegazione"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="leading-relaxed">
            Nei contratti di lavoro (CCNL) e nei software dei consulenti del lavoro, la settimana contrattuale è calcolata rigorosamente <strong>da Lunedì a Domenica</strong>.
          </p>
          <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-2 text-[11.5px] text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">
              📅 Come funziona la settimana a cavallo tra due mesi:
            </p>
            {config.gestioneSettimanaACavallo === 'mese_corrente' ? (
              <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <p>
                  Hai impostato la modalità <strong>Mese Solare</strong>: ogni turno di fine mese mantiene e calcola le proprie ore notturne e gli straordinari direttamente nel cedolino del mese in cui è svolto, senza spostamenti al mese successivo.
                </p>
              </div>
            ) : (
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>
                  <strong>Se lavori in entrambi i mesi durante la settimana a cavallo:</strong> la settimana contrattuale giunge al termine la domenica, che ricade nel mese successivo. Quando lavori anche nei primi giorni del mese successivo, <strong>sia tutti gli straordinari sia tutte le maggiorazioni notturne maturate in quella settimana vengono conteggiati ed erogati nel cedolino del mese successivo</strong>.
                </li>
                <li>
                  <strong>Nessuna ora o compenso va mai perso:</strong> nel mese attuale le ore lavorate a fine mese vengono pagate come ore ordinarie base; la quota di maggiorazione per straordinario e per lavoro notturno ti verrà liquidata nella busta paga del mese successivo.
                </li>
                <li>
                  <strong>Se invece non svolgi alcun turno nel mese successivo</strong> durante quella stessa settimana a cavallo, gli straordinari e le ore notturne restano attribuiti al mese corrente.
                </li>
              </ul>
            )}
          </div>

          {/* Link cliccabile per andare direttamente al Tariffario e modificare la regola */}
          <div className="pt-2 border-t border-emerald-200/90 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
            <div className="flex items-start sm:items-center gap-2">
              <span className="text-base shrink-0">⚙️</span>
              <div className="text-[11.5px] leading-snug">
                <span className="text-slate-600 dark:text-slate-400">Impostazione attiva: </span>
                <strong className="text-emerald-950 dark:text-emerald-100 font-bold">
                  {config.gestioneSettimanaACavallo === 'mese_corrente'
                    ? 'Accredito al proprio Mese Solare'
                    : 'Accredito al 2° Mese (Standard CCNL)'}
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenConfig?.('impostazione-settimana-cavallo')}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-white bg-emerald-100/90 hover:bg-emerald-200/90 dark:bg-emerald-900/60 dark:hover:bg-emerald-900/90 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modifica questa regola nel Tariffario</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
