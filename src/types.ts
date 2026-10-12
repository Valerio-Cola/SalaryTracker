export type DayType = 'feriale' | 'domenica' | 'festivo' | 'ferie';

export interface CustomAllowance {
  id: string;
  nome: string; // es. "Indennità Cassa", "Ticket Restaurant", "Premio Presenza"
  importo: number; // Valore in euro
  tipo: 'mensile' | 'ogni_tot_mesi' | 'una_tantum';
  intervalloMesi?: number; // es. ogni 2 mesi, ogni 3 mesi (trimestrale), ogni 6 mesi, ecc.
  meseInizio?: number; // 1-12, mese da cui partire o cadenza (es. 1=Gennaio, 3=Marzo)
  meseUnaTantum?: string; // YYYY-MM se attivo solo in un mese
  tassabile?: boolean; // false = netto esente (non tassato), true = lordo soggetto a ritenuta
}

export interface ContractConfig {
  oreSettimanali: number; // es. 24
  pagaBaseOraria: number; // es. 6.22
  bonusSupplementare: number; // es. 0.72 per ora oltre il limite settimanale
  bonusNotturno: number; // es. 1.55 per ore notturne
  oraInizioNotte?: string; // orario inizio fascia notte, default "22:00"
  oraFineNotte?: string; // orario fine fascia notte, default "06:00"
  bonusDomenicale: number; // es. 0.93 per ore in domenica
  bonusFestivo: number; // es. 1.55 per ore in festività nazionale
  aliquotaNettoStimata: number; // percentuale stima trattenute (es. 15%)
  nomeLavoratore?: string; // opzionale
  nomeAzienda?: string; // opzionale
  
  // Ratei 13ª e 14ª
  includeTredicesimaMensile?: boolean;
  modalitaTredicesima?: 'mensile' | 'annuale'; // 'mensile' = ratei 1/12, 'annuale' = unica soluzione
  importoTredicesimaMensile?: number; // es. 53.84 €
  meseErogazioneTredicesima?: number; // es. 12 (Dicembre)
  importoTredicesimaAnnuale?: number; // es. 646.08 €

  includeQuattordicesimaMensile?: boolean;
  modalitaQuattordicesima?: 'mensile' | 'annuale'; // 'mensile' = ratei 1/12, 'annuale' = unica soluzione
  importoQuattordicesimaMensile?: number; // es. 53.84 €
  meseErogazioneQuattordicesima?: number; // es. 6 (Giugno) o 7 (Luglio)
  importoQuattordicesimaAnnuale?: number; // es. 646.08 €

  // Bonus Renzi (Trattamento integrativo)
  includeBonusRenzi?: boolean;
  importoBonusRenzi?: number; // es. 98.63 €

  // Bonus L. 207/2024 Art. 1 c. 4 (Nuovo bonus cuneo fiscale Legge di Bilancio 2025)
  includeBonusL207?: boolean;
  modalitaBonusL207?: 'percentuale' | 'fisso'; // 'fisso' = valore esatto in euro, 'percentuale' = calcolato su retribuzione
  importoBonusL207Fisso?: number; // es. 45.22 € (quota maturata a settembre per PT 911,66 €)
  scaglioneBonusL207?: '8500' | '15000' | '20000' | 'personalizzato'; // 7.1%, 5.3%, 4.8%
  percentualeBonusL207?: number; // es. 5.3

  // Ferie e Permessi
  ferieAccumuloMensile?: number; // Giorni di ferie accumulati al mese (es. 2.16 o 2.08)
  ferieResiduoIniziale?: number; // Saldo ferie arretrate/iniziali in giorni (default 0)

  // Ratei o Bonus personalizzati in busta paga
  vociPersonalizzate?: CustomAllowance[];
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
  isFerie?: boolean; // true se giorno di ferie/permesso
  
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
  totaleFerie?: number;
  totaleOre: number;
  totaleOreLavorate?: number;
  totaleOreFerie?: number;
  totaleNotturne: number;
  totaleSupplementari: number;
  totaleFestiveDomenicali: number;
  totaleLordo: number;
  totaleNettoStimato: number;
  oreSettimanaliMedie: number;
}
