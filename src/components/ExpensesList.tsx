import React, { useState } from 'react';
import { Expense } from '../types';
import { Plus, Trash2, Edit2, Receipt, Calendar as CalendarIcon, Tag, AlignLeft } from 'lucide-react';

const ExpenseFormModal = React.lazy(() => import('./ExpenseFormModal').then((m) => ({ default: m.ExpenseFormModal })));

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
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          Uscite {monthTitle}
        </h3>
        <button
          onClick={() => handleOpenForm()}
          className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Aggiungi Spesa
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <Receipt className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base">Nessuna spesa registrata in questo mese.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedExpenses.map((exp) => (
              <div key={exp.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">{exp.categoria}</h4>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 font-medium">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4 text-slate-500" /> {exp.data.split('-').reverse().join('/')}</span>
                      {exp.descrizione && (
                        <span className="flex items-center gap-1"><AlignLeft className="w-4 h-4 text-slate-500" /> {exp.descrizione}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-black text-base sm:text-lg text-rose-800 dark:text-rose-300">
                    - € {exp.importo.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenForm(exp)}
                      className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Modifica"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-2 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
                      title="Elimina"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">Totale Spese Mensili</span>
              <span className="text-xl sm:text-2xl font-black text-rose-800 dark:text-rose-300">- € {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <React.Suspense fallback={null}>
        {isFormOpen && (
          <ExpenseFormModal
            expense={editingExpense}
            defaultDate={`${currentMonthKey}-01`}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
            onDelete={(id) => {
              onDeleteExpense(id);
              setIsFormOpen(false);
            }}
          />
        )}
      </React.Suspense>
    </div>
  );
};

