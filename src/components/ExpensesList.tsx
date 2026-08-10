import React, { useState } from 'react';
import { Expense } from '../types';
import { Plus, Trash2, Edit2, Receipt, Calendar as CalendarIcon, Tag, AlignLeft } from 'lucide-react';
import { ExpenseFormModal } from './ExpenseFormModal';

interface ExpensesListProps {
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  monthTitle: string;
  currentMonthKey: string;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  onSaveExpense,
  onDeleteExpense,
  monthTitle,
  currentMonthKey,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleOpenForm = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setIsFormOpen(true);
  };

  const handleSave = (expense: Expense) => {
    onSaveExpense(expense);
    setIsFormOpen(false);
  };

  const sortedExpenses = [...expenses].sort((a, b) => b.data.localeCompare(a.data));
  const total = expenses.reduce((acc, curr) => acc + curr.importo, 0);

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-rose-500" />
          Uscite {monthTitle}
        </h3>
        <button
          onClick={() => handleOpenForm()}
          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Aggiungi Spesa
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nessuna spesa registrata in questo mese.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedExpenses.map((exp) => (
              <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{exp.categoria}</h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" /> {exp.data.split('-').reverse().join('/')}</span>
                      {exp.descrizione && (
                        <span className="flex items-center gap-1"><AlignLeft className="w-3.5 h-3.5" /> {exp.descrizione}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-black text-rose-600 dark:text-rose-400">
                    - € {exp.importo.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenForm(exp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Modifica"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Vuoi eliminare questa spesa?')) onDeleteExpense(exp.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">Totale Spese Mensili</span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">- € {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <ExpenseFormModal
          expense={editingExpense}
          defaultDate={`${currentMonthKey}-01`}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
