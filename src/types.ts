export type DayType = 'feriale' | 'domenica' | 'festivo';

export interface ContractConfig {
  oreSettimanali: number; // es. 24
  pagaBaseOraria: number; // es. 6.22
  bonusSupplementare: number; // es. 0.72 per ora oltre il limite settimanale
  bonusNotturno: number; // es. 1.55 per ore tra le 22:00 e le 06:00
  bonusDomenicale: number; // es. 0.93 per ore in domenica
  bonusFestivo: number; // es. 1.55 per ore in festività nazionale
  aliquotaNettoStimata: number; // percentuale stima trattenute (es. 15%)
  nomeLavoratore?: string; // opzionale, es. "Chiara"
  nomeAzienda?: string; // opzionale, es. "Burger King"
  
  // Ratei mensili e bonus in busta paga
  includeTredicesimaMensile?: boolean;
  importoTredicesimaMensile?: number; // es. 53.84 €
  includeQuattordicesimaMensile?: boolean;
  importoQuattordicesimaMensile?: number; // es. 53.84 €
  includeBonusRenzi?: boolean;
  importoBonusRenzi?: number; // es. 98.63 €
}

export interface Shift {
  id: string;
  dataGrezza: string; // YYYY-MM-DD
  orarioInizio: string; // HH:mm
  orarioFine: string; // HH:mm
  pausaMinuti: number; // minuti di pausa (es. 0 o 30)
  tipoGiorno: DayType;
  nomeFestivita?: string; // es. "Pasquetta", "25 Aprile"
  note?: string; // es. "Chiusura cassa"
  
  // Campi calcolati
  oreTotali: number;
  oreNotturne: number;
  oreSupplementari: number;
  guadagnoBase: number;
  guadagnoNotturno: number;
  guadagnoFestivoDomenicale: number;
  guadagnoSupplementare: number;
  guadagnoTotaleLordo: number;
  guadagnoTotaleNettoStimato: number;
}

export interface QuickTemplate {
  id: string;
  titolo: string;
  orarioInizio: string;
  orarioFine: string;
  pausaMinuti: number;
  note?: string;
}

export interface Expense {
  id: string;
  data: string; // YYYY-MM-DD
  importo: number;
  categoria: string;
  descrizione?: string;
}

export interface MonthlyStats {
  annoMese: string; // YYYY-MM
  nomeMeseAnno: string; // "Agosto 2026"
  totaleTurni: number;
  totaleOre: number;
  totaleNotturne: number;
  totaleSupplementari: number;
  totaleFestiveDomenicali: number;
  totaleLordo: number;
  totaleNettoStimato: number;
  oreSettimanaliMedie: number;
}
