import React from 'react';
import { Shift, ContractConfig } from '../types';
import { DollarSign, Clock, Moon, Sun, TrendingUp, Coins } from 'lucide-react';

interface MonthSummaryCardProps {
  shifts: Shift[];
  config: ContractConfig;
  monthTitle: string;
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
  shifts,
  config,
  monthTitle,
}) => {
  const totalOre = shifts.reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalNotturne = shifts.reduce((acc, curr) => acc + curr.oreNotturne, 0);
  const totalSupplementari = shifts.reduce((acc, curr) => acc + curr.oreSupplementari, 0);
  
  const totalBase = shifts.reduce((acc, curr) => acc + curr.guadagnoBase, 0);
  const totalNotteExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoNotturno, 0);
  const totalFestivoExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoFestivoDomenicale, 0);
  const totalSuppExtra = shifts.reduce((acc, curr) => acc + curr.guadagnoSupplementare, 0);
  
  const totalShiftsLordo = shifts.reduce((acc, curr) => acc + curr.guadagnoTotaleLordo, 0);
  const totalShiftsNetto = shifts.reduce((acc, curr) => acc + curr.guadagnoTotaleNettoStimato, 0);

  // Calcolo ratei mensili 13esima, 14esima e Bonus Renzi
  const rateo13 = config.includeTredicesimaMensile ? (config.importoTredicesimaMensile ?? 53.84) : 0;
  const rateo14 = config.includeQuattordicesimaMensile ? (config.importoQuattordicesimaMensile ?? 53.84) : 0;
  const rateiLordoMensili = rateo13 + rateo14;
  const rateiNettoMensili = rateiLordoMensili * (1 - (config.aliquotaNettoStimata || 15) / 100);

  const bonusRenziNetto = config.includeBonusRenzi ? (config.importoBonusRenzi ?? 98.63) : 0;

  const totalLordoCompleto = totalShiftsLordo + rateiLordoMensili;
  const totalNettoCompleto = totalShiftsNetto + rateiNettoMensili + bonusRenziNetto;

  const hasMonthlyAdditions = config.includeTredicesimaMensile || config.includeQuattordicesimaMensile || config.includeBonusRenzi;

  // Stima monte ore del mese (indicativamente 4.33 settimane * ore contrattuali)
  const targetOreMese = (config.oreSettimanali || 24) * 4.33;
  const progressPercent = Math.min(100, Math.round((totalOre / targetOreMese) * 100));

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
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Stima Busta Paga Lorda</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              € {totalLordoCompleto.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <span>Netto stimato (~{100 - config.aliquotaNettoStimata}%):</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.2 rounded-md">€ {totalNettoCompleto.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges per Ratei Mensili e Bonus Fissi */}
      {hasMonthlyAdditions && (
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-600" /> Ratei e Bonus Inclusi nel Mese:
          </span>
          {config.includeTredicesimaMensile && (
            <span className="bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
              13ª Mensile: +€{rateo13.toFixed(2)} lordo
            </span>
          )}
          {config.includeQuattordicesimaMensile && (
            <span className="bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
              14ª Mensile: +€{rateo14.toFixed(2)} lordo
            </span>
          )}
          {config.includeBonusRenzi && (
            <span className="bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800 font-semibold text-[11px]">
              Bonus Renzi: +€{bonusRenziNetto.toFixed(2)} netto
            </span>
          )}
        </div>
      )}

      {/* Progress Bar target ore */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Ore Lavorate: <strong className="text-slate-900 dark:text-white">{totalOre.toFixed(2)} h</strong>
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
        {/* Paga Base */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Paga Base Oraria</div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            € {totalBase.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {totalOre.toFixed(1)}h × €{config.pagaBaseOraria.toFixed(2)}/h
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
