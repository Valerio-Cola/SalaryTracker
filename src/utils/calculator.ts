import { ContractConfig, Shift, DayType } from '../types';
import { checkDayTypeInfo } from './holidays';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToFormatted(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Trova la data del Lunedì relativo a una data data (in formato YYYY-MM-DD)
 */
export function getMondayIso(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0 = Dom, 1 = Lun, ...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcola le ore notturne comprese nella fascia 22:00 - 06:00
 */
export function calculateNightHours(
  startMin: number,
  rawEndMin: number,
  pauseMin: number = 0
): number {
  let endMin = rawEndMin;
  if (endMin <= startMin) {
    endMin += 24 * 60; // Il turno scavalca la mezzanotte
  }

  const shiftDurationMin = endMin - startMin;
  if (shiftDurationMin <= 0) return 0;

  // Fasce notturne in minuti assoluti dall'inizio del primo giorno:
  // Fascia A: 22:00 - 24:00 (1320 - 1440 min)
  // Fascia B: 00:00 - 06:00 del giorno dopo (1440 - 1800 min)
  // Fascia C: 00:00 - 06:00 del primo giorno se il turno inizia prima delle 06:00 (0 - 360 min)
  // Fascia D: 22:00 - 24:00 del giorno dopo se turno lunghissimo (2760 - 2880 min)

  let totalNightMins = 0;

  const nightIntervals = [
    { start: 0, end: 6 * 60 },             // 00:00 - 06:00 giorno 1
    { start: 22 * 60, end: 30 * 60 },      // 22:00 - 06:00 (24h+6h = 30h = 1800 min)
    { start: 46 * 60, end: 54 * 60 },      // 22:00 - 06:00 giorno 3
  ];

  for (const interval of nightIntervals) {
    const overlapStart = Math.max(startMin, interval.start);
    const overlapEnd = Math.min(endMin, interval.end);
    if (overlapStart < overlapEnd) {
      totalNightMins += overlapEnd - overlapStart;
    }
  }

  // Se c'è una pausa, riduciamo proporzionalmente o sottraiamo fino a 0
  if (pauseMin > 0 && totalNightMins > 0) {
    const nightRatio = totalNightMins / shiftDurationMin;
    totalNightMins = Math.max(0, totalNightMins - pauseMin * nightRatio);
  }

  return Number((totalNightMins / 60).toFixed(2));
}

/**
 * Verifica se un nuovo turno si sovrappone a uno esistente
 */
export function checkShiftOverlap(
  allShifts: Shift[],
  dataGrezza: string,
  orarioInizio: string,
  orarioFine: string,
  excludeId?: string
): boolean {
  const newStart = timeToMinutes(orarioInizio);
  let newEnd = timeToMinutes(orarioFine);
  if (newEnd <= newStart) newEnd += 24 * 60;

  for (const s of allShifts) {
    if (excludeId && s.id === excludeId) continue;
    if (s.dataGrezza === dataGrezza) {
      const existStart = timeToMinutes(s.orarioInizio);
      let existEnd = timeToMinutes(s.orarioFine);
      if (existEnd <= existStart) existEnd += 24 * 60;

      if (Math.max(newStart, existStart) < Math.min(newEnd, existEnd)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Calcola tutti i valori di un turno e ritorna l'oggetto Shift completo
 */
export function computeShiftData(
  params: {
    id?: string;
    dataGrezza: string;
    orarioInizio: string;
    orarioFine: string;
    pausaMinuti: number;
    tipoGiorno?: DayType;
    nomeFestivita?: string;
    note?: string;
  },
  config: ContractConfig,
  existingShifts: Shift[] = []
): Shift {
  const {
    id = String(Date.now() + Math.random()),
    dataGrezza,
    orarioInizio,
    orarioFine,
    pausaMinuti = 0,
    note,
  } = params;

  // Auto-rilevazione festività e domenica se non specificato manualmente
  const autoDayInfo = checkDayTypeInfo(dataGrezza);
  const tipoGiorno = params.tipoGiorno || autoDayInfo.suggestedDayType;
  const nomeFestivita = params.nomeFestivita ?? autoDayInfo.holidayName;

  const startMin = timeToMinutes(orarioInizio);
  let endMin = timeToMinutes(orarioFine);
  if (endMin <= startMin) {
    endMin += 24 * 60;
  }

  const minutiLavoratiNetto = Math.max(0, endMin - startMin - pausaMinuti);
  const oreTotali = Number((minutiLavoratiNetto / 60).toFixed(2));

  // Ore notturne
  const oreNotturne = calculateNightHours(startMin, endMin, pausaMinuti);

  // Calcolo ore supplementari/straordinarie settimanali
  const mondayOfWeek = getMondayIso(dataGrezza);
  let oreGiaLavorateSettimana = 0;

  existingShifts.forEach((s) => {
    if (s.id !== id && getMondayIso(s.dataGrezza) === mondayOfWeek) {
      oreGiaLavorateSettimana += s.oreTotali;
    }
  });

  let oreSupplementari = 0;
  const sogliaSettimanale = config.oreSettimanali || 24;

  if (oreGiaLavorateSettimana >= sogliaSettimanale) {
    oreSupplementari = oreTotali;
  } else if (oreGiaLavorateSettimana + oreTotali > sogliaSettimanale) {
    oreSupplementari = Number(
      (oreGiaLavorateSettimana + oreTotali - sogliaSettimanale).toFixed(2)
    );
  } else {
    oreSupplementari = 0;
  }

  // Calcolo guadagni lordi
  const guadagnoBase = Number((oreTotali * config.pagaBaseOraria).toFixed(2));
  const guadagnoNotturno = Number((oreNotturne * config.bonusNotturno).toFixed(2));

  let guadagnoFestivoDomenicale = 0;
  if (tipoGiorno === 'domenica') {
    guadagnoFestivoDomenicale = Number((oreTotali * config.bonusDomenicale).toFixed(2));
  } else if (tipoGiorno === 'festivo') {
    guadagnoFestivoDomenicale = Number((oreTotali * config.bonusFestivo).toFixed(2));
  }

  const guadagnoSupplementare = Number(
    (oreSupplementari * config.bonusSupplementare).toFixed(2)
  );

  const guadagnoTotaleLordo = Number(
    (
      guadagnoBase +
      guadagnoNotturno +
      guadagnoFestivoDomenicale +
      guadagnoSupplementare
    ).toFixed(2)
  );

  const aliquotaNetto = config.aliquotaNettoStimata || 15;
  const guadagnoTotaleNettoStimato = Number(
    (guadagnoTotaleLordo * (1 - aliquotaNetto / 100)).toFixed(2)
  );

  return {
    id,
    dataGrezza,
    orarioInizio,
    orarioFine,
    pausaMinuti,
    tipoGiorno,
    nomeFestivita,
    note,
    oreTotali,
    oreNotturne,
    oreSupplementari,
    guadagnoBase,
    guadagnoNotturno,
    guadagnoFestivoDomenicale,
    guadagnoSupplementare,
    guadagnoTotaleLordo,
    guadagnoTotaleNettoStimato,
  };
}

/**
 * Ricalcola tutti i turni con la configurazione aggiornata (es. se l'utente cambia le tariffe nel setup)
 */
export function recalculateAllShifts(shifts: Shift[], config: ContractConfig): Shift[] {
  // Ordiniamo prima per data in modo che il conteggio settimanale proceda cronologicamente
  const sorted = [...shifts].sort(
    (a, b) => new Date(a.dataGrezza).getTime() - new Date(b.dataGrezza).getTime()
  );

  const result: Shift[] = [];
  for (const s of sorted) {
    const updated = computeShiftData(
      {
        id: s.id,
        dataGrezza: s.dataGrezza,
        orarioInizio: s.orarioInizio,
        orarioFine: s.orarioFine,
        pausaMinuti: s.pausaMinuti,
        tipoGiorno: s.tipoGiorno,
        nomeFestivita: s.nomeFestivita,
        note: s.note,
      },
      config,
      result // passi i turni già ricalcolati prima in cronologia
    );
    result.push(updated);
  }

  return result;
}
