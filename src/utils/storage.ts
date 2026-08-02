import { ContractConfig, Shift, QuickTemplate } from '../types';
import { computeShiftData } from './calculator';

const CONFIG_KEY = 'bk_config_v2';
const SHIFTS_KEY = 'bk_storico_v2';
const TEMPLATES_KEY = 'bk_templates_v2';

export const DEFAULT_CONFIG: ContractConfig = {
  oreSettimanali: 24,
  pagaBaseOraria: 0,
  bonusSupplementare: 0,
  bonusNotturno: 0,
  bonusDomenicale: 0,
  bonusFestivo: 0,
  aliquotaNettoStimata: 15,
  nomeLavoratore: '',
  nomeAzienda: '',
};

export const DEFAULT_TEMPLATES: QuickTemplate[] = [
  {
    id: 't1',
    titolo: 'Chiusura Notte',
    orarioInizio: '18:30',
    orarioFine: '01:30',
    pausaMinuti: 30,
    note: 'Chiusura locale',
  },
  {
    id: 't2',
    titolo: 'Turno Pranzo',
    orarioInizio: '11:30',
    orarioFine: '15:30',
    pausaMinuti: 0,
    note: 'Servizio pranzo',
  },
  {
    id: 't3',
    titolo: 'Pomeriggio - Sera',
    orarioInizio: '16:00',
    orarioFine: '21:30',
    pausaMinuti: 15,
    note: 'Cassa / Sala',
  },
  {
    id: 't4',
    titolo: 'Turno Spezzato',
    orarioInizio: '12:00',
    orarioFine: '16:00',
    pausaMinuti: 0,
    note: 'Fascia di punta',
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

  const samples = [
    { day: '02', start: '18:30', end: '01:30', pause: 30, type: 'domenica' as const, note: 'Chiusura weekend' },
    { day: '04', start: '11:30', end: '16:00', pause: 0, type: 'feriale' as const, note: 'Servizio Pranzo' },
    { day: '05', start: '18:00', end: '00:30', pause: 30, type: 'feriale' as const, note: 'Cassa e cucina' },
    { day: '07', start: '19:00', end: '02:00', pause: 30, type: 'feriale' as const, note: 'Straordinario serale' },
    { day: '08', start: '12:00', end: '16:00', pause: 0, type: 'feriale' as const, note: 'Pranzo Sabato' },
    { day: '09', start: '18:30', end: '01:30', pause: 30, type: 'domenica' as const, note: 'Chiusura Domenicale' },
    { day: '12', start: '11:30', end: '15:30', pause: 0, type: 'feriale' as const, note: 'Pranzo' },
    { day: '15', start: '18:00', end: '02:00', pause: 30, type: 'festivo' as const, note: 'Turno Ferragosto' },
  ];

  const result: Shift[] = [];
  for (const item of samples) {
    const dateStr = `${year}-${month}-${item.day}`;
    const shift = computeShiftData(
      {
        dataGrezza: dateStr,
        orarioInizio: item.start,
        orarioFine: item.end,
        pausaMinuti: item.pause,
        tipoGiorno: item.type,
        note: item.note,
      },
      config,
      result
    );
    result.push(shift);
  }
  return result;
}
