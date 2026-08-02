import React from 'react';
import { Shift, ContractConfig } from '../types';
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
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

interface ChartsViewProps {
  shifts: Shift[];
  monthTitle: string;
  config?: ContractConfig;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ shifts, monthTitle, config }) => {
  if (shifts.length === 0) return null;

  // Calcolo dati per il grafico a torta (Composizione Stipendio)
  const totalBase = shifts.reduce((acc, curr) => acc + curr.guadagnoBase, 0);
  const totalNotte = shifts.reduce((acc, curr) => acc + curr.guadagnoNotturno, 0);
  const totalFestivo = shifts.reduce((acc, curr) => acc + curr.guadagnoFestivoDomenicale, 0);
  const totalSupp = shifts.reduce((acc, curr) => acc + curr.guadagnoSupplementare, 0);

  const rateo13 = config?.includeTredicesimaMensile ? (config.importoTredicesimaMensile ?? 53.84) : 0;
  const rateo14 = config?.includeQuattordicesimaMensile ? (config.importoQuattordicesimaMensile ?? 53.84) : 0;
  const bonusRenzi = config?.includeBonusRenzi ? (config.importoBonusRenzi ?? 98.63) : 0;

  const pieData = [
    { name: 'Paga Base', value: Number(totalBase.toFixed(2)), color: '#3b82f6' },
    { name: 'Bonus Notte', value: Number(totalNotte.toFixed(2)), color: '#6366f1' },
    { name: 'Festivi & Domeniche', value: Number(totalFestivo.toFixed(2)), color: '#f43f5e' },
    { name: 'Straordinari', value: Number(totalSupp.toFixed(2)), color: '#10b981' },
    { name: 'Rateo 13ª', value: Number(rateo13.toFixed(2)), color: '#f59e0b' },
    { name: 'Rateo 14ª', value: Number(rateo14.toFixed(2)), color: '#d97706' },
    { name: 'Bonus Renzi', value: Number(bonusRenzi.toFixed(2)), color: '#14b8a6' },
  ].filter((item) => item.value > 0);

  // Calcolo dati per il grafico a barre (Ore per giorno)
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`€ ${value.toFixed(2)}`, 'Importo']}
                contentStyle={{ borderRadius: '12px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barre Ore e Turni */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Andamento Ore Lavorate per Turno
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Visualizza le ore ordinarie e straordinarie di ciascuna giornata
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="giorno" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="h" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} h`,
                  name === 'oreOrdinarie' ? 'Ore Ordinarie' : 'Ore Straordinari',
                ]}
                contentStyle={{ borderRadius: '12px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Bar dataKey="oreOrdinarie" name="Ore Ordinarie" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="oreStraordinarie" name="Ore Straordinarie" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
