import { ContractConfig, Shift, QuickTemplate, Expense, AppEvent } from '../types';
import { computeShiftData } from './calculator';

const CONFIG_KEY = 'bk_config_v2';
const SHIFTS_KEY = 'bk_storico_v2';
const TEMPLATES_KEY = 'bk_templates_v2';
const EXPENSES_KEY = 'bk_expenses_v2';
const EVENTS_KEY = 'bk_events_v2';

export const DEFAULT_CONFIG: ContractConfig = {
  oreSettimanali: 0,
  pagaBaseOraria: 0,
  bonusSupplementare: 0,
  bonusNotturno: 0,
  oraInizioNotte: '',
  oraFineNotte: '',
  bonusDomenicale: 0,
  bonusFestivo: 0,
  aliquotaNettoStimata: 0,
  nomeLavoratore: '',
  nomeAzienda: '',
  includeTredicesimaMensile: false,
  modalitaTredicesima: 'mensile',
  importoTredicesimaMensile: 53.84,
  meseErogazioneTredicesima: 12,
  importoTredicesimaAnnuale: 646.08,
  includeQuattordicesimaMensile: false,
  modalitaQuattordicesima: 'mensile',
  importoQuattordicesimaMensile: 53.84,
  meseErogazioneQuattordicesima: 6,
  importoQuattordicesimaAnnuale: 646.08,
  includeBonusRenzi: false,
  importoBonusRenzi: 98.63,
  includeBonusL207: false,
  modalitaBonusL207: 'fisso',
  importoBonusL207Fisso: 45.22,
  scaglioneBonusL207: '15000',
  percentualeBonusL207: 5.3,
  ferieAccumuloMensile: 0,
  ferieResiduoIniziale: 0,
  vociPersonalizzate: [],
  maggiorazioniOrariePersonalizzate: [],
};

export const DEFAULT_TEMPLATES: QuickTemplate[] = [
  {
    id: 't1',
    titolo: 'Turno Pranzo',
    orarioInizio: '11:30',
    orarioFine: '15:30',
    pausaMinuti: 0,
    note: 'Servizio pranzo',
  },
  {
    id: 't2',
    titolo: 'Chiusura Notte',
    orarioInizio: '18:30',
    orarioFine: '01:30',
    pausaMinuti: 30,
    note: 'Chiusura locale',
  },
];

export function getStoredConfig(): ContractConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) {
      // Prova a recuperare dal vecchio formato bk_config se presente
      const oldRaw = localStorage.getItem('bk_config');
      if (oldRaw) {
        const parsedOld = JSON.parse(oldRaw);
        return {
          ...DEFAULT_CONFIG,
          oreSettimanali: Number(parsedOld.oreSett) || 24,
          pagaBaseOraria: Number(parsedOld.base) || 0,
          bonusSupplementare: Number(parsedOld.supp) || 0,
          bonusNotturno: Number(parsedOld.notte) || 0,
          bonusDomenicale: Number(parsedOld.domenica) || 0,
          bonusFestivo: Number(parsedOld.festivo) || 0,
        };
      }
      return DEFAULT_CONFIG;
    }
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading config from localStorage', e);
    return DEFAULT_CONFIG;
  }
}

export function saveStoredConfig(config: ContractConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config to localStorage', e);
  }
}

export function getStoredShifts(): Shift[] {
  try {
    const raw = localStorage.getItem(SHIFTS_KEY);
    if (!raw) {
      // Prova il formato vecchio
      const oldRaw = localStorage.getItem('bk_storico');
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        const config = getStoredConfig();
        const converted: Shift[] = [];
        for (const item of oldParsed) {
          const shift = computeShiftData(
            {
              dataGrezza: item.dataGrezza,
              orarioInizio: item.strInizio,
              orarioFine: item.strFine,
              pausaMinuti: 0,
              tipoGiorno: item.tipoGiorno || 'feriale',
            },
            config,
            converted
          );
          converted.push(shift);
        }
        saveStoredShifts(converted);
        return converted;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading shifts from localStorage', e);
    return [];
  }
}

export function saveStoredShifts(shifts: Shift[]): void {
  try {
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
  } catch (e) {
    console.error('Error saving shifts to localStorage', e);
  }
}

export function getStoredTemplates(): QuickTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_TEMPLATES;
  }
}

export function saveStoredTemplates(templates: QuickTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Error saving templates', e);
  }
}

/**
 * Carica dati di esempio realistici per il mese corrente per test/dimostrazione immediata
 */
export function generateSampleShifts(config: ContractConfig): Shift[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const sampleDays = [
    { day: '02', start: '18:30', end: '01:30', pause: 30, note: 'Chiusura serale' },
    { day: '04', start: '11:30', end: '16:00', pause: 0, note: 'Servizio Pranzo' },
    { day: '05', start: '18:00', end: '00:30', pause: 30, note: 'Cassa e cucina' },
    { day: '07', start: '19:00', end: '02:00', pause: 30, note: 'Straordinario serale' },
    { day: '08', start: '12:00', end: '16:00', pause: 0, note: 'Pranzo' },
    { day: '09', start: '18:30', end: '01:30', pause: 30, note: 'Chiusura serale' },
    { day: '12', start: '11:30', end: '15:30', pause: 0, note: 'Pranzo' },
    { day: '15', start: '18:00', end: '00:30', pause: 30, note: 'Turno serale' },
  ];

  const result: Shift[] = [];
  for (const item of sampleDays) {
    const dateStr = `${year}-${month}-${item.day}`;
    const shift = computeShiftData(
      {
        dataGrezza: dateStr,
        orarioInizio: item.start,
        orarioFine: item.end,
        pausaMinuti: item.pause,
        note: item.note,
      },
      config,
      result
    );
    result.push(shift);
  }
  return result;
}

export function getStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expenses from localStorage', e);
    return [];
  }
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage', e);
  }
}

export function getStoredEvents(): AppEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading events from localStorage', e);
    return [];
  }
}

export function saveStoredEvents(events: AppEvent[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events to localStorage', e);
  }
}

export function generateSampleEvents(): AppEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Alcuni eventi realistici posizionati attorno a oggi e nei giorni del mese
  const dayNum = now.getDate();
  const pad = (n: number) => String(Math.max(1, Math.min(28, n))).padStart(2, '0');

  return [
    {
      id: 'ev-sample-1',
      titolo: 'Visita medica di controllo',
      data: `${year}-${month}-${pad(dayNum + 1)}`,
      oraInizio: '09:30',
      oraFine: '10:30',
      tuttoIlGiorno: false,
      categoria: 'salute',
      colore: 'emerald',
      luogo: 'Poliambulatorio Centrale',
      note: 'Portare impegnativa e referti precedenti',
    },
    {
      id: 'ev-sample-2',
      titolo: 'Riunione pianificazione turni',
      data: `${year}-${month}-${pad(dayNum + 3)}`,
      oraInizio: '15:00',
      oraFine: '16:00',
      tuttoIlGiorno: false,
      categoria: 'lavoro',
      colore: 'blue',
      luogo: 'Ufficio Direzione',
      note: 'Discutere disponibilità per le festività',
    },
    {
      id: 'ev-sample-3',
      titolo: 'Scadenza pagamento bolletta luce',
      data: `${year}-${month}-${pad(dayNum + 5)}`,
      tuttoIlGiorno: true,
      categoria: 'scadenza',
      colore: 'rose',
      note: 'Bolletta Enel Servizio Elettrico',
    },
    {
      id: 'ev-sample-4',
      titolo: 'Cena compleanno con amici',
      data: `${year}-${month}-${pad(dayNum + 8)}`,
      oraInizio: '20:30',
      oraFine: '23:30',
      tuttoIlGiorno: false,
      categoria: 'svago',
      colore: 'purple',
      luogo: 'Ristorante Il Borgo',
      note: 'Prenotazione a nome Marco',
    },
    {
      id: 'ev-sample-5',
      titolo: 'Revisione auto',
      data: `${year}-${month}-${pad(dayNum + 14)}`,
      oraInizio: '10:00',
      oraFine: '11:00',
      tuttoIlGiorno: false,
      categoria: 'commissione',
      colore: 'amber',
      luogo: 'Officina Rossi',
      note: 'Controllo fumi e tagliando annuale',
    },
  ];
}
