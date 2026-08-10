import React from 'react';
import { Shift, ContractConfig, Expense } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Receipt, TrendingUp, DollarSign, Wallet, Calendar } from 'lucide-react';

interface ChartsViewProps {
  shifts: Shift[];
  expenses?: Expense[];
  allShifts?: Shift[];
  allExpenses?: Expense[];
  monthTitle: string;
  config?: ContractConfig;
}

const SHORT_MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function formatMonthKey(key: string): string {
  const [y, m] = key.split('-');
  const monthIdx = parseInt(m, 10) - 1;
  const monthName = SHORT_MONTHS[monthIdx] || m;
  const yearShort = y ? y.slice(2) : '';
  return `${monthName} '${yearShort}`;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  shifts,
  expenses = [],
  allShifts = [],
  allExpenses = [],
  monthTitle,
  config,
}) => {
  // Se allShifts o allExpenses non sono passati, fallback sui dati mensili corrente
  const fullShifts = allShifts.length > 0 ? allShifts : shifts;
  const fullExpenses = allExpenses.length > 0 ? allExpenses : expenses;

  if (fullShifts.length === 0 && fullExpenses.length === 0) return null;

  // 1. RACCOLTA E RAGGRUPPAMENTO DATI PER MESI (TREND STORICO)
  const allMonthKeysSet = new Set<string>();
  fullShifts.forEach((s) => {
    if (s.dataGrezza && s.dataGrezza.length >= 7) {
      allMonthKeysSet.add(s.dataGrezza.slice(0, 7));
    }
  });
  fullExpenses.forEach((e) => {
    if (e.data && e.data.length >= 7) {
      allMonthKeysSet.add(e.data.slice(0, 7));
    }
  });

  const sortedMonthKeys = Array.from(allMonthKeysSet).sort((a, b) => a.localeCompare(b));

  const rateo13 = config?.includeTredicesimaMensile ? (config.importoTredicesimaMensile ?? 53.84) : 0;
  const rateo14 = config?.includeQuattordicesimaMensile ? (config.importoQuattordicesimaMensile ?? 53.84) : 0;
  const rateiLordoMensili = rateo13 + rateo14;
  const taxRateDecimal = (config?.aliquotaNettoStimata || 15) / 100;
  const rateiNettoMensili = rateiLordoMensili * (1 - taxRateDecimal);
  const bonusRenziNetto = config?.includeBonusRenzi ? (config.importoBonusRenzi ?? 98.63) : 0;

  const trendData = sortedMonthKeys.map((mKey) => {
    const mShifts = fullShifts.filter((s) => s.dataGrezza.startsWith(mKey));
    const mExpenses = fullExpenses.filter((e) => e.data.startsWith(mKey));

    const mShiftsLordo = mShifts.reduce((acc, curr) => acc + curr.guadagnoTotaleLordo, 0);
    const mShiftsNetto = mShifts.reduce((acc, curr) => acc + curr.guadagnoTotaleNettoStimato, 0);

    const mTotalLordo = mShifts.length > 0 ? mShiftsLordo + rateiLordoMensili : 0;
    const mTotalNetto = mShifts.length > 0 ? mShiftsNetto + rateiNettoMensili + bonusRenziNetto : 0;

    const mTotalExpenses = mExpenses.reduce((acc, curr) => acc + curr.importo, 0);
    const mRisparmio = mTotalNetto - mTotalExpenses;

    return {
      monthKey: mKey,
      label: formatMonthKey(mKey),
      stipendioNetto: Number(mTotalNetto.toFixed(2)),
      stipendioLordo: Number(mTotalLordo.toFixed(2)),
      spese: Number(mTotalExpenses.toFixed(2)),
      risparmio: Number(mRisparmio.toFixed(2)),
      hasShifts: mShifts.length > 0,
      hasExpenses: mExpenses.length > 0,
    };
  });

  // Calcolo delle medie storiche
  const monthsWithShifts = trendData.filter((d) => d.hasShifts);
  const shiftMonthsCount = monthsWithShifts.length || 1;
  const stipendioMedioNetto = monthsWithShifts.reduce((acc, d) => acc + d.stipendioNetto, 0) / shiftMonthsCount;
  const stipendioMedioLordo = monthsWithShifts.reduce((acc, d) => acc + d.stipendioLordo, 0) / shiftMonthsCount;

  const totalActiveMonths = trendData.length || 1;
  const spesaMediaMensile = trendData.reduce((acc, d) => acc + d.spese, 0) / totalActiveMonths;
  const risparmioMedioMensile = stipendioMedioNetto - spesaMediaMensile;

  // 2. CALCOLI PER IL MESE CORRENTE (Dati dettagliati)
  const totalBase = shifts.reduce((acc, curr) => acc + curr.guadagnoBase, 0);
  const totalNotte = shifts.reduce((acc, curr) => acc + curr.guadagnoNotturno, 0);
  const totalFestivo = shifts.reduce((acc, curr) => acc + curr.guadagnoFestivoDomenicale, 0);
  const totalSupp = shifts.reduce((acc, curr) => acc + curr.guadagnoSupplementare, 0);

  const pieData = [
    { name: 'Paga Base', value: Number(totalBase.toFixed(2)), color: '#3b82f6' },
    { name: 'Bonus Notte', value: Number(totalNotte.toFixed(2)), color: '#6366f1' },
    { name: 'Festivi & Domeniche', value: Number(totalFestivo.toFixed(2)), color: '#f43f5e' },
    { name: 'Straordinari', value: Number(totalSupp.toFixed(2)), color: '#10b981' },
    { name: 'Rateo 13ª', value: Number(rateo13.toFixed(2)), color: '#f59e0b' },
    { name: 'Rateo 14ª', value: Number(rateo14.toFixed(2)), color: '#d97706' },
    { name: 'Bonus Renzi', value: Number(bonusRenziNetto.toFixed(2)), color: '#14b8a6' },
  ].filter((item) => item.value > 0);

  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.dataGrezza).getTime() - new Date(b.dataGrezza).getTime()
  );

  const barData = sortedShifts.map((s) => {
    const d = new Date(s.dataGrezza + 'T00:00:00');
    return {
      giorno: `${d.getDate()}/${d.getMonth() + 1}`,
      oreOrdinarie: Number((s.oreTotali - s.oreSupplementari).toFixed(2)),
      oreStraordinarie: Number(s.oreSupplementari.toFixed(2)),
      oreNotturne: Number(s.oreNotturne.toFixed(2)),
      guadagno: s.guadagnoTotaleLordo,
    };
  });

  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.importo;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

  const expensesPieData = Object.entries(expensesByCategory)
    .map(([name, value], index) => ({
      name,
      value: Number((value as number).toFixed(2)),
      color: COLORS[index % COLORS.length],
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 fade-in">
      {/* SEZIONE 1: SCHEDE MEDIE STORICHE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stipendio Medio Netto */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Stipendio Medio (Netto)
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              € {stipendioMedioNetto.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lordo medio: <span className="font-semibold">€ {stipendioMedioLordo.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Spesa Media Mensile */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Spesa Media Mensile
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 leading-tight">
              - € {spesaMediaMensile.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Media uscite registrate
            </div>
          </div>
        </div>

        {/* Risparmio Medio Mensile */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            risparmioMedioMensile >= 0
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
          }`}>
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rimanenza Media
            </div>
            <div className={`text-2xl font-black leading-tight ${
              risparmioMedioMensile >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              € {risparmioMedioMensile.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bilancio medio mensile
            </div>
          </div>
        </div>

        {/* Mesi Tracciati */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mesi Registrati
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {totalActiveMonths} {totalActiveMonths === 1 ? 'Mese' : 'Mesi'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Storico complessivo
            </div>
          </div>
        </div>
      </div>

      {/* SEZIONE 2: GRAFICO ANDAMENTO STORICO STIPENDI VS SPESE */}
      {trendData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Andamento Storico: Stipendi vs Spese
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confronto mensile tra stipendio netto stimato e uscite totali
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} accessibilityLayer={false}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="€" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `€ ${value.toFixed(2)}`,
                    name === 'stipendioNetto'
                      ? 'Stipendio Netto'
                      : name === 'spese'
                      ? 'Spese'
                      : 'Rimanenza',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                  }}
                  wrapperStyle={{ outline: 'none' }}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="stipendioNetto" name="Stipendio Netto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spese" name="Spese" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="risparmio"
                  name="Rimanenza"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SEZIONE 3: GRAFICI DETTAGLIATI MESE CORRENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Torta Composizione Retribuzione */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
            <PieIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Composizione Busta Paga ({monthTitle})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribuzione tra paga base lorda e maggiorazioni orarie
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer={false}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  activeShape={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`€ ${value.toFixed(2)}`, 'Importo']}
                  contentStyle={{ borderRadius: '12px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barre Ore e Turni */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Ore Lavorate per Turno ({monthTitle})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Visualizza le ore ordinarie e straordinarie di ciascuna giornata
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} accessibilityLayer={false}>
                <XAxis dataKey="giorno" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="h" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} h`,
                    name === 'oreOrdinarie' ? 'Ore Ordinarie' : 'Ore Straordinari',
                  ]}
                  contentStyle={{ borderRadius: '12px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  wrapperStyle={{ outline: 'none' }}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="oreOrdinarie" name="Ore Ordinarie" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="oreStraordinarie" name="Ore Straordinarie" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Torta Categorie Spese */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
            <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Spese per Categoria ({monthTitle})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribuzione delle uscite mensili
          </p>

          {expensesPieData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart accessibilityLayer={false}>
                  <Pie
                    data={expensesPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    activeShape={false}
                  >
                    {expensesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`€ ${value.toFixed(2)}`, 'Importo']}
                    contentStyle={{ borderRadius: '12px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
              <Receipt className="w-10 h-10 opacity-50" />
              <p className="text-sm font-medium">Nessuna spesa registrata nel mese</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

