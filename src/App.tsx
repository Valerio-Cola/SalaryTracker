import React, { useState, useEffect } from 'react';
import { ContractConfig, Shift, QuickTemplate, Expense, AppEvent } from './types';
import {
  getStoredConfig,
  saveStoredConfig,
  getStoredShifts,
  saveStoredShifts,
  getStoredTemplates,
  saveStoredTemplates,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredEvents,
  saveStoredEvents,
  generateSampleShifts,
  generateSampleEvents,
  DEFAULT_CONFIG,
} from './utils/storage';
import { recalculateAllShifts } from './utils/calculator';
import { exportDataToJson, exportShiftsToCsv, printMonthlyReport, exportShiftsToGoogleCalendar } from './utils/export';
import { getSyncCredentials, pushToCloud, pullFromCloud } from './utils/syncService';

import { Header } from './components/Header';
import { MonthSummaryCard } from './components/MonthSummaryCard';
import { EventsSummaryCard } from './components/EventsSummaryCard';
import { CalendarView } from './components/CalendarView';
import { ShiftList } from './components/ShiftList';
import { EventsList } from './components/EventsList';
import { ExpensesList } from './components/ExpensesList';

import { ChartsView } from './components/ChartsView';
import { ContractSetupModal } from './components/ContractSetupModal';
import { ShiftFormModal } from './components/ShiftFormModal';
import { EventFormModal } from './components/EventFormModal';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { PrivacyLegalModal } from './components/PrivacyLegalModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { HelpModal } from './components/HelpModal';

import {
  Calendar,
  List,
  BarChart2,
  Upload,
  CalendarCheck2,
  Download,
  Info,
  CheckCircle2,
  Receipt,
  HelpCircle,
  Sparkles,
  Plus,
  Sliders,
} from 'lucide-react';

export default function App() {
  // Configurazione e Stato dati
  const [config, setConfig] = useState<ContractConfig>(getStoredConfig());
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const raw = getStoredShifts();
    const conf = getStoredConfig();
    const cleaned = recalculateAllShifts(raw, conf);
    saveStoredShifts(cleaned);
    return cleaned;
  });
  const [templates, setTemplates] = useState<QuickTemplate[]>(getStoredTemplates());
  const [expenses, setExpenses] = useState<Expense[]>(getStoredExpenses());
  const [events, setEvents] = useState<AppEvent[]>(() => getStoredEvents());

  // Modalità calendario: 'shifts' (Turni di lavoro) | 'events' (Eventi)
  const [calendarContentMode, setCalendarContentMode] = useState<'shifts' | 'events'>(() => {
    try {
      const saved = localStorage.getItem('app_calendar_content_mode');
      if (saved === 'shifts' || saved === 'events') return saved;
    } catch {
      // fallback
    }
    return 'shifts';
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_calendar_content_mode', calendarContentMode);
    } catch {
      // fallback
    }
  }, [calendarContentMode]);

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
  const [monthChangeTrigger, setMonthChangeTrigger] = useState<number>(0);

  const handleMonthChange = (key: string) => {
    setCurrentMonthKey(key);
    setMonthChangeTrigger((prev) => prev + 1);
  };

  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'events' | 'expenses' | 'charts'>(() => {
    try {
      const saved = localStorage.getItem('app_active_tab');
      if (saved === 'calendar' || saved === 'list' || saved === 'events' || saved === 'expenses' || saved === 'charts') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'calendar';
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_active_tab', activeTab);
    } catch {
      // fallback
    }
  }, [activeTab]);

  // Modali
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState<boolean>(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
  const [initialDateForShift, setInitialDateForShift] = useState<string | undefined>(undefined);
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [initialDateForExpense, setInitialDateForExpense] = useState<string | undefined>(undefined);

  const [eventToEdit, setEventToEdit] = useState<AppEvent | null>(null);
  const [initialDateForEvent, setInitialDateForEvent] = useState<string | undefined>(undefined);

  const [notification, setNotification] = useState<string | null>(null);

  // Auto-Sincronizzazione in background se abilitata
  const checkAndAutoSync = async (
    latestConfig: ContractConfig,
    latestShifts: Shift[],
    latestExpenses: Expense[],
    latestEvents: AppEvent[]
  ) => {
    const creds = getSyncCredentials();
    if (creds.autoSync && creds.workerUrl && creds.userKey && creds.passcode) {
      pushToCloud(creds, {
        config: latestConfig,
        shifts: latestShifts,
        templates,
        expenses: latestExpenses,
        events: latestEvents,
      }).catch(() => {});
    }
  };

  // Applicazione dati scaricati dal cloud (con unione sicura del contratto per non perdere le tariffe)
  const handleApplyCloudData = (data: {
    config?: ContractConfig;
    shifts?: Shift[];
    templates?: QuickTemplate[];
    expenses?: Expense[];
    events?: AppEvent[];
  }) => {
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
    if (data.events && Array.isArray(data.events)) {
      setEvents(data.events);
      saveStoredEvents(data.events);
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

  // Salva configurazione e ricalcola i turni (con eventuale aggiornamento sincronizzato dei template)
  const handleSaveConfig = (newConfig: ContractConfig, newTemplates?: QuickTemplate[]) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);

    const activeTemplates = newTemplates || templates;
    if (newTemplates) {
      setTemplates(newTemplates);
      saveStoredTemplates(newTemplates);
    }

    // Ricalcola immediatamente tutti i turni con le nuove tariffe
    const updatedShifts = recalculateAllShifts(shifts, newConfig);
    setShifts(updatedShifts);
    saveStoredShifts(updatedShifts);
    showNotification('Tariffe aggiornate! Tutti i turni sono stati ricalcolati.');

    const creds = getSyncCredentials();
    if (creds.autoSync && creds.workerUrl && creds.userKey && creds.passcode) {
      pushToCloud(creds, { config: newConfig, shifts: updatedShifts, templates: activeTemplates, expenses, events }).catch(() => {});
    }
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

      // Effetto festeggiamento on-demand (non blocca il caricamento iniziale)
      import('canvas-confetti')
        .then((module) => {
          const confettiFn = (module.default || module) as (options?: Record<string, unknown>) => void;
          confettiFn({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
          });
        })
        .catch(() => {
          // Fallback sicuro se canvas-confetti non è supportato in iframe
        });
    }

    // Ordiniamo e ricalcoliamo per mantenere coerenza straordinari settimanali
    const recalculated = recalculateAllShifts(updatedShifts, config);
    setShifts(recalculated);
    saveStoredShifts(recalculated);

    checkAndAutoSync(config, recalculated, expenses, events);
  };

  // Elimina Turno
  const handleDeleteShift = (shiftId: string) => {
    const filtered = shifts.filter((s) => s.id !== shiftId);
    const recalculated = recalculateAllShifts(filtered, config);
    setShifts(recalculated);
    saveStoredShifts(recalculated);
    showNotification('Turno eliminato dallo storico.');

    checkAndAutoSync(config, recalculated, expenses, events);
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
    checkAndAutoSync(config, shifts, updatedExpenses, events);
  };

  // Elimina Spesa
  const handleDeleteExpense = (expenseId: string) => {
    const filtered = expenses.filter((e) => e.id !== expenseId);
    setExpenses(filtered);
    saveStoredExpenses(filtered);
    showNotification('Spesa eliminata.');
    checkAndAutoSync(config, shifts, filtered, events);
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

  // Salva (Aggiungi o Modifica) Evento
  const handleSaveEvent = (event: AppEvent) => {
    let updatedEvents: AppEvent[];
    const exists = events.some((e) => e.id === event.id);

    if (exists) {
      updatedEvents = events.map((e) => (e.id === event.id ? event : e));
      showNotification('Evento modificato con successo!');
    } else {
      updatedEvents = [...events, event];
      showNotification('Nuovo evento salvato in agenda!');
    }

    setEvents(updatedEvents);
    saveStoredEvents(updatedEvents);
    checkAndAutoSync(config, shifts, expenses, updatedEvents);
  };

  // Elimina Evento
  const handleDeleteEvent = (eventId: string) => {
    const filtered = events.filter((e) => e.id !== eventId);
    setEvents(filtered);
    saveStoredEvents(filtered);
    showNotification('Evento eliminato dall\'agenda.');
    checkAndAutoSync(config, shifts, expenses, filtered);
  };

  const handleOpenAddEvent = (dateIso?: string) => {
    setEventToEdit(null);
    setInitialDateForEvent(dateIso || `${currentMonthKey}-01`);
    setIsEventFormOpen(true);
  };

  const handleOpenEditEvent = (event: AppEvent) => {
    setEventToEdit(event);
    setInitialDateForEvent(event.data);
    setIsEventFormOpen(true);
  };

  // Reset solo storico turni
  const handleResetShiftsOnly = () => {
    if (confirm('Vuoi davvero cancellare TUTTI i turni dallo storico? Le impostazioni della paga rimarranno salvate.')) {
      setShifts([]);
      saveStoredShifts([]);
      setIsConfigOpen(false);
      showNotification('Storico turni svuotato.');
      checkAndAutoSync(config, [], expenses, events);
    }
  };

  // Elimina turni in un intervallo di date
  const handleDeleteShiftsInRange = (fromDate: string, toDate: string) => {
    const toDeleteCount = shifts.filter((s) => s.dataGrezza >= fromDate && s.dataGrezza <= toDate).length;
    if (toDeleteCount === 0) {
      alert('Nessun turno trovato nell\'intervallo selezionato.');
      return;
    }
    const [y1, m1, d1] = fromDate.split('-');
    const [y2, m2, d2] = toDate.split('-');
    const formattedFrom = `${d1}/${m1}/${y1}`;
    const formattedTo = `${d2}/${m2}/${y2}`;

    if (confirm(`Confermi di voler eliminare ${toDeleteCount} turno/i compresi tra il ${formattedFrom} e il ${formattedTo}? Le tariffe contrattuali rimarranno salvate.`)) {
      const remainingShifts = shifts.filter((s) => s.dataGrezza < fromDate || s.dataGrezza > toDate);
      const recalculated = recalculateAllShifts(remainingShifts, config);
      setShifts(recalculated);
      saveStoredShifts(recalculated);
      setIsConfigOpen(false);
      showNotification(`${toDeleteCount} turno/i eliminati con successo tra il ${formattedFrom} e il ${formattedTo}.`);
      checkAndAutoSync(config, recalculated, expenses, events);
    }
  };

  // Carica dati di esempio (turni ed eventi)
  const handleGenerateSampleData = () => {
    const sampleShifts = generateSampleShifts(config);
    const sampleEvents = generateSampleEvents();
    setShifts(sampleShifts);
    saveStoredShifts(sampleShifts);
    setEvents(sampleEvents);
    saveStoredEvents(sampleEvents);
    showNotification('Caricati turni ed eventi di esempio per il mese corrente!');
    checkAndAutoSync(config, sampleShifts, expenses, sampleEvents);
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

            if (parsed.events && Array.isArray(parsed.events)) {
              setEvents(parsed.events);
              saveStoredEvents(parsed.events);
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

  // Filtraggio turni, spese ed eventi del mese corrente
  const currentMonthShifts = shifts.filter((s) => s.dataGrezza.startsWith(currentMonthKey));
  const currentMonthExpenses = expenses.filter((e) => e.data.startsWith(currentMonthKey));
  const currentMonthEvents = events.filter((e) => e.data.startsWith(currentMonthKey));

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
        onMonthChange={handleMonthChange}
        onOpenAddShift={() => handleOpenAddShift()}
        onOpenAddEvent={() => handleOpenAddEvent()}
        calendarContentMode={calendarContentMode}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onExportCsv={() => exportShiftsToCsv(currentMonthShifts, formattedMonthTitle)}
        onPrintReport={() => printMonthlyReport(currentMonthShifts, config, formattedMonthTitle)}
        onExportGoogleCalendar={() => exportShiftsToGoogleCalendar(currentMonthShifts, formattedMonthTitle)}
        onExportJson={() => exportDataToJson(config, shifts, expenses, events)}
        onImportJson={handleImportJson}
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
        
        {/* SEO Hidden H1 */}
        <h1 className="sr-only">
          Calcolo Stipendio Netto, Gestione Turni Lavorativi e Calendario Eventi - Work & Salary Tracker
        </h1>

        {/* Banner Benvenuto / Setup rapido se prima volta */}
        {shifts.length === 0 && events.length === 0 && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border border-slate-800">
            <div className="space-y-3 max-w-2xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>👋</span> Benvenuto su Salary Tracker!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  Monitora i tuoi turni, organizza i tuoi eventi e calcola la tua busta paga in tempo reale.
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs text-slate-300 leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="shrink-0 text-sm">🌙</span>
                  <span>
                    <strong className="text-white">Calcolo automatico maggiorazioni:</strong> Rilevamento immediato di turni notturni, domeniche e festività.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="shrink-0 text-sm">📅</span>
                  <span>
                    <strong className="text-white">Calendario bi-funzione:</strong> Passa dai turni di lavoro alla gestione dei tuoi eventi e impegni personali con un click.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="shrink-0 text-sm">⏱️</span>
                  <span>
                    <strong className="text-white">Straordinari su misura:</strong> Conteggio automatico delle ore extra in base al tuo contratto settimanale.
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1.5 text-xs text-blue-200/90 font-medium border-t border-slate-800/80">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Hai dubbi su tariffe o impostazioni? Visita la sezione <strong>Aiuto</strong> per una guida completa.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
              <button
                onClick={() => handleOpenAddShift()}
                className="flex-1 lg:flex-initial px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-200" />
                Aggiungi Primo Turno
              </button>
              
              <button
                onClick={() => handleOpenAddEvent()}
                className="flex-1 lg:flex-initial px-4 py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-200" />
                Aggiungi Primo Evento
              </button>

              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex-1 lg:flex-initial px-4 py-2.5 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-blue-400" />
                Tariffe & Preset Orari
              </button>

              <button
                onClick={handleGenerateSampleData}
                className="flex-1 lg:flex-initial px-3.5 py-2 text-slate-400 hover:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Carica Dati Demo
              </button>
            </div>
          </div>
        )}

        {/* Card Sintesi del Mese / Box Eventi:
            Sostituzione dinamica del riepilogo in base alla modalità attiva (Turni vs Eventi) come richiesto dall'utente */}
        {((activeTab === 'calendar' && calendarContentMode === 'events') || activeTab === 'events') ? (
          <EventsSummaryCard
            events={events}
            monthTitle={formattedMonthTitle}
            currentMonthKey={currentMonthKey}
            onOpenAddEvent={handleOpenAddEvent}
            onEditEvent={handleOpenEditEvent}
            onSwitchToShiftsView={() => {
              setCalendarContentMode('shifts');
              if (activeTab === 'events') setActiveTab('calendar');
            }}
          />
        ) : (
          <MonthSummaryCard
            shifts={currentMonthShifts}
            allShifts={shifts}
            config={config}
            monthTitle={formattedMonthTitle}
            currentMonthKey={currentMonthKey}
            expenses={currentMonthExpenses}
          />
        )}

        {/* Tab Navigation: Calendario / Elenco Turni / Eventi / Spese / Grafici */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 p-1.5 rounded-xl overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Calendario
            </button>

            <button
              onClick={() => {
                setActiveTab('list');
                setCalendarContentMode('shifts');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Turni ({currentMonthShifts.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('events');
                setCalendarContentMode('events');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              Eventi ({currentMonthEvents.length})
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              Spese ({currentMonthExpenses.length})
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Statistiche
            </button>
          </div>

          {/* Azioni Backup Ripristino JSON */}
          <div className="hidden sm:flex items-center gap-2">
            <label className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
              <Upload className="w-4 h-4 shrink-0" />
              Ripristina Backup
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
            monthChangeTrigger={monthChangeTrigger}
            shifts={shifts}
            expenses={expenses}
            events={events}
            calendarContentMode={calendarContentMode}
            onToggleCalendarContentMode={setCalendarContentMode}
            onSelectDate={(dateIso) => handleOpenAddShift(dateIso)}
            onSelectDateForEvent={(dateIso) => handleOpenAddEvent(dateIso)}
            onAddExpense={(dateIso) => handleOpenAddExpense(dateIso)}
            onEditShift={handleOpenEditShift}
            onEditExpense={handleOpenEditExpense}
            onEditEvent={handleOpenEditEvent}
            onMonthChange={handleMonthChange}
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

        {activeTab === 'events' && (
          <EventsList
            events={events}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenAddEvent={handleOpenAddEvent}
            monthTitle={formattedMonthTitle}
            currentMonthKey={currentMonthKey}
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
          <React.Suspense
            fallback={
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 my-4 text-slate-500">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-sm font-medium">Caricamento grafici e statistiche in corso...</span>
              </div>
            }
          >
            <ChartsView 
              shifts={currentMonthShifts} 
              expenses={currentMonthExpenses}
              allShifts={shifts}
              allExpenses={expenses}
              monthTitle={formattedMonthTitle} 
              config={config} 
            />
          </React.Suspense>
        )}
      </main>

      <React.Suspense fallback={null}>
        {isConfigOpen && (
          <ContractSetupModal
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
            config={config}
            shifts={shifts}
            onSave={handleSaveConfig}
            onResetShiftsOnly={handleResetShiftsOnly}
            onDeleteShiftsInRange={handleDeleteShiftsInRange}
            templates={templates}
            onSaveTemplates={(newTemplates) => {
              setTemplates(newTemplates);
              saveStoredTemplates(newTemplates);
              const creds = getSyncCredentials();
              if (creds.autoSync && creds.workerUrl && creds.userKey && creds.passcode) {
                const currentConfig = getStoredConfig();
                pushToCloud(creds, { config: currentConfig, shifts, templates: newTemplates, expenses, events }).catch(() => {});
              }
            }}
          />
        )}

        {isFormOpen && (
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
        )}

        {isEventFormOpen && (
          <EventFormModal
            isOpen={isEventFormOpen}
            onClose={() => setIsEventFormOpen(false)}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            eventToEdit={eventToEdit}
            initialDate={initialDateForEvent}
          />
        )}

        {isExpenseFormOpen && (
          <ExpenseFormModal
            expense={expenseToEdit}
            defaultDate={initialDateForExpense}
            onClose={() => setIsExpenseFormOpen(false)}
            onSave={handleSaveExpense}
            onDelete={(id) => {
              handleDeleteExpense(id);
              setIsExpenseFormOpen(false);
            }}
          />
        )}

        {isPrivacyModalOpen && (
          <PrivacyLegalModal
            isOpen={isPrivacyModalOpen}
            onClose={() => setIsPrivacyModalOpen(false)}
          />
        )}

        {isCloudSyncOpen && (
          <CloudSyncModal
            isOpen={isCloudSyncOpen}
            onClose={() => setIsCloudSyncOpen(false)}
            config={config}
            shifts={shifts}
            templates={templates}
            expenses={expenses}
            events={events}
            onApplyCloudData={handleApplyCloudData}
            onShowNotification={showNotification}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          />
        )}

        {isHelpModalOpen && (
          <HelpModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />
        )}
      </React.Suspense>

      {/* Footer Legal & Privacy */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-600 dark:text-slate-400 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">🍔 Salary Tracker SK</span>
              <span className="mx-2">•</span>
              <span>Calcolo Stipendio & Gestione Turni</span>
            </div>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Note Legali, Privacy & Cookie Policy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">⚠️ Disclaimer di Calcolo:</strong>
              Strumento di calcolo indicativo ad uso personale. Non costituisce documento ufficiale né busta paga aziendale.
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">🔒 Privacy & Storage Flessibile:</strong>
              Di default i dati risiedono solo nel browser (LocalStorage). Se attivi la sincronizzazione cloud inserendo le tue credenziali, i dati vengono salvati sul tuo database Cloudflare D1 / Worker privato per sincronizzarli tra i tuoi dispositivi.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold">
            <div>
              Sito realizzato da <a href="https://valeriocola.it" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">Valerio Cola</a>
            </div>
            <div className="flex items-center">
              <a
                href="https://ko-fi.com/I1A228L9XZ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Offrimi un caffè su Ko-fi"
              >
                <img
                  src="/kofi.png"
                  width="143"
                  height="36"
                  loading="lazy"
                  decoding="async"
                  style={{ border: '0px', width: '143px', height: '36px', aspectRatio: '143 / 36' }}
                  alt="Buy Me a Coffee at ko-fi.com"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
