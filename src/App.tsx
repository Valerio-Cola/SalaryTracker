import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ContractConfig, Shift, QuickTemplate, Expense } from './types';
import {
  getStoredConfig,
  saveStoredConfig,
  getStoredShifts,
  saveStoredShifts,
  getStoredTemplates,
  saveStoredTemplates,
  getStoredExpenses,
  saveStoredExpenses,
  generateSampleShifts,
  DEFAULT_CONFIG,
} from './utils/storage';
import { recalculateAllShifts } from './utils/calculator';
import { exportDataToJson, exportShiftsToCsv, printMonthlyReport } from './utils/export';
import { getSyncCredentials, pushToCloud, pullFromCloud } from './utils/syncService';

import { Header } from './components/Header';
import { MonthSummaryCard } from './components/MonthSummaryCard';
import { CalendarView } from './components/CalendarView';
import { ShiftList } from './components/ShiftList';
import { ChartsView } from './components/ChartsView';
import { ExpensesList } from './components/ExpensesList';
import { ContractSetupModal } from './components/ContractSetupModal';
import { ShiftFormModal } from './components/ShiftFormModal';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { PrivacyLegalModal } from './components/PrivacyLegalModal';
import { CloudSyncModal } from './components/CloudSyncModal';

import {
  Calendar,
  List,
  BarChart2,
  Upload,
  Download,
  Info,
  CheckCircle2,
  Receipt,
} from 'lucide-react';

export default function App() {
  // Configurazione e Stato dati
  const [config, setConfig] = useState<ContractConfig>(getStoredConfig());
  const [shifts, setShifts] = useState<Shift[]>(getStoredShifts());
  const [templates, setTemplates] = useState<QuickTemplate[]>(getStoredTemplates());
  const [expenses, setExpenses] = useState<Expense[]>(getStoredExpenses());

  // Gestione Tema Notte / Giorno
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Mese corrente in selezione (YYYY-MM)
  const getInitialMonthKey = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getInitialMonthKey());
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'expenses' | 'charts'>('calendar');

  // Modali
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);

  const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
  const [initialDateForShift, setInitialDateForShift] = useState<string | undefined>(undefined);
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [initialDateForExpense, setInitialDateForExpense] = useState<string | undefined>(undefined);

  const [notification, setNotification] = useState<string | null>(null);

  // Auto-Sincronizzazione in background se abilitata
  const checkAndAutoSync = async (latestConfig: ContractConfig, latestShifts: Shift[], latestExpenses: Expense[]) => {
    const creds = getSyncCredentials();
    if (creds.autoSync && creds.workerUrl && creds.userKey && creds.passcode) {
      pushToCloud(creds, { config: latestConfig, shifts: latestShifts, templates, expenses: latestExpenses }).catch(() => {});
    }
  };

  // Applicazione dati scaricati dal cloud (con unione sicura del contratto per non perdere le tariffe)
  const handleApplyCloudData = (data: { config?: ContractConfig; shifts?: Shift[]; templates?: QuickTemplate[]; expenses?: Expense[] }) => {
    let activeConfig = config;
    if (data.config) {
      activeConfig = { ...DEFAULT_CONFIG, ...data.config };
      setConfig(activeConfig);
      saveStoredConfig(activeConfig);
    }
    if (data.shifts && Array.isArray(data.shifts)) {
      const recalculated = recalculateAllShifts(data.shifts, activeConfig);
      setShifts(recalculated);
      saveStoredShifts(recalculated);
    }
    if (data.templates && Array.isArray(data.templates)) {
      setTemplates(data.templates);
      saveStoredTemplates(data.templates);
    }
    if (data.expenses && Array.isArray(data.expenses)) {
      setExpenses(data.expenses);
      saveStoredExpenses(data.expenses);
    }
  };

  // Auto-Pull dal Cloud all'avvio dell'applicazione se collegato
  useEffect(() => {
    const creds = getSyncCredentials();
    if (creds.autoSync && creds.workerUrl && creds.userKey && creds.passcode) {
      pullFromCloud(creds).then((res) => {
        if (res.success && res.data) {
          handleApplyCloudData(res.data);
          showNotification('Sincronizzazione cloud completata: tariffe e turni aggiornati!');
        }
      }).catch((e) => {
        console.error('Errore auto-pull cloud all\'avvio:', e);
      });
    }
  }, []);

  // Mostra notifica temporanea
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Salva configurazione e ricalcola i turni
  const handleSaveConfig = (newConfig: ContractConfig) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);

    // Ricalcola immediatamente tutti i turni con le nuove tariffe
    const updatedShifts = recalculateAllShifts(shifts, newConfig);
    setShifts(updatedShifts);
    saveStoredShifts(updatedShifts);
    showNotification('Tariffe aggiornate! Tutti i turni sono stati ricalcolati.');

    checkAndAutoSync(newConfig, updatedShifts, expenses);
  };

  // Salva (Aggiungi o Modifica) Turno
  const handleSaveShift = (shift: Shift) => {
    let updatedShifts: Shift[];
    const exists = shifts.some((s) => s.id === shift.id);

    if (exists) {
      updatedShifts = shifts.map((s) => (s.id === shift.id ? shift : s));
      showNotification('Turno modificato con successo!');
    } else {
      updatedShifts = [...shifts, shift];
      showNotification('Nuovo turno aggiunto con successo!');

      // Effetto festeggiamento
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Fallback sicuro se canvas-confetti non è supportato in iframe
      }
    }

    // Ordiniamo e ricalcoliamo per mantenere coerenza straordinari settimanali
    const recalculated = recalculateAllShifts(updatedShifts, config);
    setShifts(recalculated);
    saveStoredShifts(recalculated);

    checkAndAutoSync(config, recalculated, expenses);
  };

  // Elimina Turno
  const handleDeleteShift = (shiftId: string) => {
    const filtered = shifts.filter((s) => s.id !== shiftId);
    const recalculated = recalculateAllShifts(filtered, config);
    setShifts(recalculated);
    saveStoredShifts(recalculated);
    showNotification('Turno eliminato dallo storico.');

    checkAndAutoSync(config, recalculated, expenses);
  };

  // Salva (Aggiungi o Modifica) Spesa
  const handleSaveExpense = (expense: Expense) => {
    let updatedExpenses: Expense[];
    const exists = expenses.some((e) => e.id === expense.id);

    if (exists) {
      updatedExpenses = expenses.map((e) => (e.id === expense.id ? expense : e));
      showNotification('Spesa modificata con successo!');
    } else {
      updatedExpenses = [...expenses, expense];
      showNotification('Nuova spesa aggiunta con successo!');
    }

    setExpenses(updatedExpenses);
    saveStoredExpenses(updatedExpenses);
    checkAndAutoSync(config, shifts, updatedExpenses);
  };

  // Elimina Spesa
  const handleDeleteExpense = (expenseId: string) => {
    const filtered = expenses.filter((e) => e.id !== expenseId);
    setExpenses(filtered);
    saveStoredExpenses(filtered);
    showNotification('Spesa eliminata.');
    checkAndAutoSync(config, shifts, filtered);
  };

  const handleOpenAddExpense = (dateIso?: string) => {
    setExpenseToEdit(null);
    setInitialDateForExpense(dateIso || `${currentMonthKey}-01`);
    setIsExpenseFormOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseFormOpen(true);
  };

  // Reset solo storico turni
  const handleResetShiftsOnly = () => {
    if (confirm('Vuoi davvero cancellare TUTTI i turni dallo storico? Le impostazioni della paga rimarranno salvate.')) {
      setShifts([]);
      saveStoredShifts([]);
      setIsConfigOpen(false);
      showNotification('Storico turni svuotato.');
    }
  };

  // Carica dati di esempio
  const handleGenerateSampleData = () => {
    const samples = generateSampleShifts(config);
    setShifts(samples);
    saveStoredShifts(samples);
    showNotification('Caricati turni di esempio per il mese corrente!');
  };

  // Importa Backup JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.shifts && Array.isArray(parsed.shifts)) {
            if (parsed.config) {
              setConfig(parsed.config);
              saveStoredConfig(parsed.config);
            }
            const updated = recalculateAllShifts(parsed.shifts, parsed.config || config);
            setShifts(updated);
            saveStoredShifts(updated);
            
            if (parsed.expenses && Array.isArray(parsed.expenses)) {
              setExpenses(parsed.expenses);
              saveStoredExpenses(parsed.expenses);
            }
            
            showNotification('Backup ripristinato con successo!');
          } else {
            alert('File JSON non valido o formato errato.');
          }
        } catch (err) {
          alert('Errore nella lettura del file di backup.');
        }
      };
    }
  };

  // Apertura Modale Nuovo Turno (con eventuale data preimpostata dal calendario)
  const handleOpenAddShift = (dateIso?: string) => {
    setShiftToEdit(null);
    setInitialDateForShift(dateIso);
    setIsFormOpen(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setShiftToEdit(shift);
    setInitialDateForShift(shift.dataGrezza);
    setIsFormOpen(true);
  };

  // Filtraggio turni del mese corrente
  const currentMonthShifts = shifts.filter((s) => s.dataGrezza.startsWith(currentMonthKey));
  const currentMonthExpenses = expenses.filter((e) => e.data.startsWith(currentMonthKey));

  // Formattazione titolo mese per stampa/export
  const [yStr, mStr] = currentMonthKey.split('-');
  const dateForTitle = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1);
  const formattedMonthTitle = dateForTitle.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      {/* Toast Notifica */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        currentMonthKey={currentMonthKey}
        onMonthChange={setCurrentMonthKey}
        onOpenAddShift={() => handleOpenAddShift()}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onExportCsv={() => exportShiftsToCsv(currentMonthShifts, formattedMonthTitle)}
        onPrintReport={() => printMonthlyReport(currentMonthShifts, config, formattedMonthTitle)}
        onGenerateSampleData={handleGenerateSampleData}
        hasShifts={shifts.length > 0}
        theme={theme}
        onToggleTheme={toggleTheme}
        isCloudConnected={(() => {
          const c = getSyncCredentials();
          return !!(c.workerUrl && c.userKey && c.passcode);
        })()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Benvenuto / Setup rapido se prima volta */}
        {shifts.length === 0 && (
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-lg font-extrabold flex items-center justify-center sm:justify-start gap-2">
                Benvenuto nel Salary Tracker SK!
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Questa applicazione calcola in automatico le ore notturne (22:00-06:00), le festività rosse italiane, le domeniche e gli straordinari settimanali basandosi sulle tariffe del contratto.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerateSampleData}
                className="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
              >
                Carica Dati di Prova
              </button>
              <button
                onClick={() => handleOpenAddShift()}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-sm shadow-blue-500/10 transition-colors"
              >
                Aggiungi Primo Turno
              </button>
            </div>
          </div>
        )}

        {/* Card Sintesi del Mese */}
        <MonthSummaryCard
          shifts={currentMonthShifts}
          config={config}
          monthTitle={formattedMonthTitle}
          expenses={currentMonthExpenses}
        />

        {/* Tab Navigation: Calendario / Elenco Turni / Spese / Grafici */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Calendario
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Turni ({currentMonthShifts.length})
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Spese ({currentMonthExpenses.length})
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'charts'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Statistiche
            </button>
          </div>

          {/* Backup Actions JSON */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => exportDataToJson(config, shifts, expenses)}
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center gap-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Backup JSON
            </button>

            <label className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center gap-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Ripristina
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Tab Views Content */}
        {activeTab === 'calendar' && (
          <CalendarView
            currentMonthKey={currentMonthKey}
            shifts={currentMonthShifts}
            expenses={currentMonthExpenses}
            onSelectDate={(dateIso) => handleOpenAddShift(dateIso)}
            onAddExpense={(dateIso) => handleOpenAddExpense(dateIso)}
            onEditShift={handleOpenEditShift}
            onEditExpense={handleOpenEditExpense}
          />
        )}

        {activeTab === 'list' && (
          <ShiftList
            shifts={currentMonthShifts}
            onEditShift={handleOpenEditShift}
            onDeleteShift={handleDeleteShift}
            onOpenAddShift={() => handleOpenAddShift()}
            monthTitle={formattedMonthTitle}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesList
            expenses={currentMonthExpenses}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            monthTitle={formattedMonthTitle}
            currentMonthKey={currentMonthKey}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsView 
            shifts={currentMonthShifts} 
            expenses={currentMonthExpenses}
            allShifts={shifts}
            allExpenses={expenses}
            monthTitle={formattedMonthTitle} 
            config={config} 
          />
        )}
      </main>

      {/* Modals */}
      <ContractSetupModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        onResetShiftsOnly={handleResetShiftsOnly}
      />

      <ShiftFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        shiftToEdit={shiftToEdit}
        config={config}
        allShifts={shifts}
        templates={templates}
        onSaveShift={handleSaveShift}
        onDeleteShift={handleDeleteShift}
        initialDate={initialDateForShift}
      />

      {isExpenseFormOpen && (
        <ExpenseFormModal
          expense={expenseToEdit}
          defaultDate={initialDateForExpense}
          onClose={() => setIsExpenseFormOpen(false)}
          onSave={handleSaveExpense}
        />
      )}

      <PrivacyLegalModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        config={config}
        shifts={shifts}
        templates={templates}
        onApplyCloudData={handleApplyCloudData}
        onShowNotification={showNotification}
      />

      {/* Footer Legal & Privacy */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">🍔 Salary Tracker SK</span>
              <span className="mx-2">•</span>
              <span>Calcolo Stipendio & Gestione Turni</span>
            </div>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              Note Legali, Privacy & Cookie Policy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">⚠️ Disclaimer di Calcolo:</strong>
              Strumento di calcolo indicativo ad uso personale. Non costituisce documento ufficiale né busta paga aziendale.
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">🔒 Privacy & Storage Flessibile:</strong>
              Di default i dati risiedono solo nel browser (LocalStorage). Se attivi la sincronizzazione cloud inserendo le tue credenziali, i dati vengono salvati sul tuo Worker Cloudflare KV privato per sincronizzarli tra i tuoi dispositivi.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
