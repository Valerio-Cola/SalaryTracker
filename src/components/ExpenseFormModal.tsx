import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { Receipt, Calendar as CalendarIcon, Tag, AlignLeft } from 'lucide-react';

interface ExpenseFormModalProps {
  expense?: Expense | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  expense,
  defaultDate,
  onClose,
  onSave,
}) => {
  const [dateStr, setDateStr] = useState(defaultDate || '');
  const [importoStr, setImportoStr] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descrizione, setDescrizione] = useState('');

  useEffect(() => {
    if (expense) {
      setDateStr(expense.data);
      setImportoStr(expense.importo.toString());
      setCategoria(expense.categoria);
      setDescrizione(expense.descrizione || '');
    } else if (defaultDate) {
      setDateStr(defaultDate);
    }
  }, [expense, defaultDate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const importoNum = parseFloat(importoStr);
    if (isNaN(importoNum) || importoNum <= 0) return;

    const newExpense: Expense = {
      id: expense ? expense.id : `exp_${Date.now()}`,
      data: dateStr,
      importo: importoNum,
      categoria: categoria || 'Altro',
      descrizione: descrizione.trim(),
    };

    onSave(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-500" />
            {expense ? 'Modifica Spesa' : 'Nuova Spesa'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" /> Data
            </label>
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Categoria
            </label>
            <input
              type="text"
              required
              placeholder="Es. Spesa, Affitto, Trasporti..."
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Importo Speso (€)
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={importoStr}
              onChange={(e) => setImportoStr(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-shadow font-mono text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Descrizione (opzionale)
            </label>
            <textarea
              placeholder="Dettagli sulla spesa..."
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-shadow resize-none text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-white font-bold bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/30 rounded-xl transition-colors"
            >
              Salva Spesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
