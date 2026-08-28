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
 * Trova la data del Lunedì relativo a una data (in formato YYYY-MM-DD)
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
 * Trova la data della Domenica (fine settimana) a partire dal Lunedì o da qualsiasi giorno della settimana
 */
export function getSundayIso(mondayOrDateStr: string): string {
  const mondayStr = getMondayIso(mondayOrDateStr);
  const monday = new Date(mondayStr + 'T00:00:00');
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const y = sunday.getFullYear();
  const m = String(sunday.getMonth() + 1).padStart(2, '0');
  const d = String(sunday.getDate()).padStart(2, '0');
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
  if (!orarioInizio || !orarioFine) return false;
  const newStart = timeToMinutes(orarioInizio);
  let newEnd = timeToMinutes(orarioFine);
  if (newEnd <= newStart) newEnd += 24 * 60;

  for (const s of allShifts) {
    if (excludeId && s.id === excludeId) continue;
    if (s.dataGrezza === dataGrezza && s.tipoGiorno !== 'ferie') {
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
 * Calcola tutti i valori di un turno o giorno di ferie e ritorna l'oggetto Shift completo
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
    isFerie?: boolean;
    oreTotaliCustom?: number;
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

  // Rilevazione se si tratta di ferie
  const isFerie = params.isFerie || params.tipoGiorno === 'ferie';

  // Auto-rilevazione festività e domenica se non specificato manualmente
  const autoDayInfo = checkDayTypeInfo(dataGrezza);
  let tipoGiorno: DayType = params.tipoGiorno || autoDayInfo.suggestedDayType;
  if (isFerie) {
    tipoGiorno = 'ferie';
  }
  const nomeFestivita = isFerie ? undefined : (params.nomeFestivita ?? autoDayInfo.holidayName);

  let oreTotali = 0;
  let oreNotturne = 0;

  if (isFerie) {
    // Per le ferie, se sono specificate ore personalizzate usa quelle, altrimenti calcola da orari o usa il monte ore giornaliero
    if (params.oreTotaliCustom !== undefined && params.oreTotaliCustom > 0) {
      oreTotali = Number(params.oreTotaliCustom.toFixed(2));
    } else if (orarioInizio && orarioFine && orarioInizio !== orarioFine) {
      const startMin = timeToMinutes(orarioInizio);
      let endMin = timeToMinutes(orarioFine);
      if (endMin <= startMin) endMin += 24 * 60;
      const minutiLavoratiNetto = Math.max(0, endMin - startMin - pausaMinuti);
      oreTotali = Number((minutiLavoratiNetto / 60).toFixed(2));
    } else {
      // Default: ore giornaliere indicative (es. 24h/5gg = 4.8h)
      oreTotali = Number(((config.oreSettimanali || 24) / 5).toFixed(2));
    }
    oreNotturne = 0;
  } else {
    // Se non sono ancora stati inseriti entrambi gli orari per il turno di lavoro, non calcolare ore fittizie
    if (!orarioInizio || !orarioFine || orarioInizio.trim() === '' || orarioFine.trim() === '') {
      oreTotali = 0;
      oreNotturne = 0;
    } else {
      const startMin = timeToMinutes(orarioInizio);
      let endMin = timeToMinutes(orarioFine);
      if (endMin <= startMin) {
        endMin += 24 * 60;
      }

      const minutiLavoratiNetto = Math.max(0, endMin - startMin - pausaMinuti);
      oreTotali = Number((minutiLavoratiNetto / 60).toFixed(2));

      // Ore notturne (22:00 - 06:00)
      oreNotturne = calculateNightHours(startMin, endMin, pausaMinuti);
    }
  }

  // Calcolo ore supplementari/straordinarie settimanali (tenendo conto delle ferie per il monte ore)
  const mondayOfWeek = getMondayIso(dataGrezza);
  const sundayOfWeek = getSundayIso(dataGrezza);
  const monthOfMonday = mondayOfWeek.slice(0, 7);
  const monthOfSunday = sundayOfWeek.slice(0, 7);
  const isCrossMonthWeek = monthOfMonday !== monthOfSunday;
  const currentShiftMonth = dataGrezza.slice(0, 7);

  let oreGiaLavorateSettimana = 0;
  existingShifts.forEach((s) => {
    if (s.id !== id && getMondayIso(s.dataGrezza) === mondayOfWeek) {
      oreGiaLavorateSettimana += s.oreTotali;
    }
  });

  let oreSupplementari = 0;
  const sogliaSettimanale = config.oreSettimanali || 24;

  if (isFerie) {
    // Le ferie non prendono maggiorazione straordinario di per sé, ma contano per il monte ore
    oreSupplementari = 0;
  } else if (oreTotali === 0) {
    // Nessun orario o 0 ore: nessun calcolo di straordinario
    oreSupplementari = 0;
  } else if (isCrossMonthWeek && currentShiftMonth === monthOfMonday) {
    // Settimana a cavallo tra 2 mesi: i giorni che ricadono nel primo mese NON maturano straordinari in questo mese;
    // gli straordinari dell'intera settimana vengono conteggiati ed attribuiti al secondo mese!
    oreSupplementari = 0;
  } else {
    // Settimana nello stesso mese, oppure giorni nel secondo mese della settimana a cavallo:
    if (oreGiaLavorateSettimana >= sogliaSettimanale) {
      oreSupplementari = oreTotali;
    } else if (oreGiaLavorateSettimana + oreTotali > sogliaSettimanale) {
      oreSupplementari = Number(
        (oreGiaLavorateSettimana + oreTotali - sogliaSettimanale).toFixed(2)
      );
    } else {
      oreSupplementari = 0;
    }
  }

  // Calcolo guadagni lordi
  const guadagnoBase = Number((oreTotali * config.pagaBaseOraria).toFixed(2));
  const guadagnoNotturno = isFerie ? 0 : Number((oreNotturne * config.bonusNotturno).toFixed(2));

  let guadagnoFestivoDomenicale = 0;
  if (!isFerie) {
    if (tipoGiorno === 'domenica') {
      guadagnoFestivoDomenicale = Number((oreTotali * config.bonusDomenicale).toFixed(2));
    } else if (tipoGiorno === 'festivo') {
      guadagnoFestivoDomenicale = Number((oreTotali * config.bonusFestivo).toFixed(2));
    }
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
    orarioInizio: isFerie && !orarioInizio ? '09:00' : orarioInizio,
    orarioFine: isFerie && !orarioFine ? '17:00' : orarioFine,
    pausaMinuti: isFerie ? 0 : pausaMinuti,
    tipoGiorno,
    nomeFestivita,
    note: isFerie && !note ? 'Ferie / Permesso retribuito' : note,
    isFerie,
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
 * Ricalcola tutti i turni con la configurazione aggiornata,
 * gestendo la corretta attribuzione degli straordinari delle settimane a cavallo tra 2 mesi
 * e il conteggio delle ferie per il raggiungimento del monte ore settimanale contrattuale.
 */
export function recalculateAllShifts(shifts: Shift[], config: ContractConfig): Shift[] {
  if (shifts.length === 0) return [];

  // Ordiniamo prima per data e poi per orario di inizio
  const sorted = [...shifts].sort((a, b) => {
    const timeDiff = new Date(a.dataGrezza).getTime() - new Date(b.dataGrezza).getTime();
    if (timeDiff !== 0) return timeDiff;
    return (a.orarioInizio || '').localeCompare(b.orarioInizio || '');
  });

  // Raggruppiamo i turni per settimana (Lunedì - Domenica)
  const weekMap = new Map<string, Shift[]>();
  for (const s of sorted) {
    const mondayIso = getMondayIso(s.dataGrezza);
    if (!weekMap.has(mondayIso)) {
      weekMap.set(mondayIso, []);
    }
    weekMap.get(mondayIso)!.push(s);
  }

  const sogliaSettimanale = config.oreSettimanali || 24;
  const aliquotaNetto = config.aliquotaNettoStimata || 15;
  const finalShifts: Shift[] = [];

  // Elaboriamo settimana per settimana
  for (const [mondayIso, weekShifts] of weekMap.entries()) {
    const sundayIso = getSundayIso(mondayIso);
    const month1 = mondayIso.slice(0, 7); // Mese in cui inizia la settimana
    const month2 = sundayIso.slice(0, 7); // Mese in cui finisce la settimana
    const isCrossMonth = month1 !== month2;

    // Calcoliamo prima i dati base (ore totali, ore notturne, paga base, festivo) per ciascun turno
    const processedWeekShifts: Shift[] = weekShifts.map((s) => {
      const isFerie = s.isFerie || s.tipoGiorno === 'ferie';
      const autoDayInfo = checkDayTypeInfo(s.dataGrezza);
      const tipoGiorno: DayType = isFerie ? 'ferie' : (s.tipoGiorno || autoDayInfo.suggestedDayType);
      const nomeFestivita = isFerie ? undefined : (s.nomeFestivita ?? autoDayInfo.holidayName);

      let oreTotali = s.oreTotali;
      let oreNotturne = 0;

      if (isFerie) {
        oreTotali = s.oreTotali > 0 ? s.oreTotali : Number(((config.oreSettimanali || 24) / 5).toFixed(2));
        oreNotturne = 0;
      } else {
        const startMin = timeToMinutes(s.orarioInizio);
        let endMin = timeToMinutes(s.orarioFine);
        if (endMin <= startMin) endMin += 24 * 60;
        const minutiNetto = Math.max(0, endMin - startMin - (s.pausaMinuti || 0));
        oreTotali = Number((minutiNetto / 60).toFixed(2));
        oreNotturne = calculateNightHours(startMin, endMin, s.pausaMinuti || 0);
      }

      const guadagnoBase = Number((oreTotali * config.pagaBaseOraria).toFixed(2));
      const guadagnoNotturno = isFerie ? 0 : Number((oreNotturne * config.bonusNotturno).toFixed(2));
      
      let guadagnoFestivoDomenicale = 0;
      if (!isFerie) {
        if (tipoGiorno === 'domenica') {
          guadagnoFestivoDomenicale = Number((oreTotali * config.bonusDomenicale).toFixed(2));
        } else if (tipoGiorno === 'festivo') {
          guadagnoFestivoDomenicale = Number((oreTotali * config.bonusFestivo).toFixed(2));
        }
      }

      return {
        ...s,
        isFerie,
        tipoGiorno,
        nomeFestivita,
        oreTotali,
        oreNotturne,
        oreSupplementari: 0,
        guadagnoBase,
        guadagnoNotturno,
        guadagnoFestivoDomenicale,
        guadagnoSupplementare: 0,
        guadagnoTotaleLordo: guadagnoBase + guadagnoNotturno + guadagnoFestivoDomenicale,
        guadagnoTotaleNettoStimato: Number(((guadagnoBase + guadagnoNotturno + guadagnoFestivoDomenicale) * (1 - aliquotaNetto / 100)).toFixed(2)),
      };
    });

    // Calcoliamo le ore complessive della settimana (inclusi i giorni di ferie che coprono il monte ore)
    const totalWeekHours = processedWeekShifts.reduce((acc, curr) => acc + curr.oreTotali, 0);
    const totalWeekOvertime = Math.max(0, Number((totalWeekHours - sogliaSettimanale).toFixed(2)));

    if (totalWeekOvertime <= 0) {
      // Nessuno straordinario nella settimana
      finalShifts.push(...processedWeekShifts);
      continue;
    }

    if (!isCrossMonth) {
      // CASO 1: Settimana interamente all'interno dello stesso mese
      let accumulatedHours = 0;
      for (const s of processedWeekShifts) {
        let shiftOvertime = 0;
        if (!s.isFerie) {
          if (accumulatedHours >= sogliaSettimanale) {
            shiftOvertime = s.oreTotali;
          } else if (accumulatedHours + s.oreTotali > sogliaSettimanale) {
            shiftOvertime = Number((accumulatedHours + s.oreTotali - sogliaSettimanale).toFixed(2));
          }
        }
        accumulatedHours += s.oreTotali;

        s.oreSupplementari = shiftOvertime;
        s.guadagnoSupplementare = Number((shiftOvertime * config.bonusSupplementare).toFixed(2));
        s.guadagnoTotaleLordo = Number((s.guadagnoBase + s.guadagnoNotturno + s.guadagnoFestivoDomenicale + s.guadagnoSupplementare).toFixed(2));
        s.guadagnoTotaleNettoStimato = Number((s.guadagnoTotaleLordo * (1 - aliquotaNetto / 100)).toFixed(2));
        finalShifts.push(s);
      }
    } else {
      // CASO 2: Settimana a cavallo tra due mesi (es. Lun-Mar in Agosto, Mer-Dom in Settembre)
      // Regola: gli straordinari dell'intera settimana (considerando sia i giorni del 1° mese che del 2° mese)
      // vanno attribuiti al secondo mese!
      const month1Shifts = processedWeekShifts.filter((s) => s.dataGrezza.startsWith(month1));
      const month2Shifts = processedWeekShifts.filter((s) => s.dataGrezza.startsWith(month2));

      // I turni del primo mese ricevono 0 straordinario
      for (const s of month1Shifts) {
        s.oreSupplementari = 0;
        s.guadagnoSupplementare = 0;
        s.guadagnoTotaleLordo = Number((s.guadagnoBase + s.guadagnoNotturno + s.guadagnoFestivoDomenicale).toFixed(2));
        s.guadagnoTotaleNettoStimato = Number((s.guadagnoTotaleLordo * (1 - aliquotaNetto / 100)).toFixed(2));
        finalShifts.push(s);
      }

      // Se ci sono turni nel secondo mese, attribuiamo a questi tutti gli straordinari maturati nell'intera settimana
      if (month2Shifts.length > 0) {
        let remainingOvertimeToAssign = totalWeekOvertime;
        // Preferiamo assegnare gli straordinari ai turni lavorati (non ferie)
        const targetShifts = month2Shifts.filter((s) => !s.isFerie);
        const shiftsToUse = targetShifts.length > 0 ? targetShifts : month2Shifts;

        for (let i = 0; i < month2Shifts.length; i++) {
          const s = month2Shifts[i];
          let shiftOvertime = 0;

          if (shiftsToUse.includes(s)) {
            const isLast = s === shiftsToUse[shiftsToUse.length - 1];
            if (isLast) {
              // L'ultimo turno riceve tutto il rimanente straordinario per garantire il totale esatto
              shiftOvertime = Number(remainingOvertimeToAssign.toFixed(2));
              remainingOvertimeToAssign = 0;
            } else {
              shiftOvertime = Math.min(s.oreTotali, remainingOvertimeToAssign);
              shiftOvertime = Number(shiftOvertime.toFixed(2));
              remainingOvertimeToAssign = Number((remainingOvertimeToAssign - shiftOvertime).toFixed(2));
            }
          }

          s.oreSupplementari = shiftOvertime;
          s.guadagnoSupplementare = Number((shiftOvertime * config.bonusSupplementare).toFixed(2));
          s.guadagnoTotaleLordo = Number((s.guadagnoBase + s.guadagnoNotturno + s.guadagnoFestivoDomenicale + s.guadagnoSupplementare).toFixed(2));
          s.guadagnoTotaleNettoStimato = Number((s.guadagnoTotaleLordo * (1 - aliquotaNetto / 100)).toFixed(2));
          finalShifts.push(s);
        }
      } else {
        // Se nel secondo mese non ci sono stati turni inseriti, ma nel primo mese si era superata la soglia,
        // assegniamo gli straordinari all'ultimo turno del primo mese per non perdere i dati
        let accumulatedHours = 0;
        for (const s of month1Shifts) {
          let shiftOvertime = 0;
          if (!s.isFerie) {
            if (accumulatedHours >= sogliaSettimanale) {
              shiftOvertime = s.oreTotali;
            } else if (accumulatedHours + s.oreTotali > sogliaSettimanale) {
              shiftOvertime = Number((accumulatedHours + s.oreTotali - sogliaSettimanale).toFixed(2));
            }
          }
          accumulatedHours += s.oreTotali;
          s.oreSupplementari = shiftOvertime;
          s.guadagnoSupplementare = Number((shiftOvertime * config.bonusSupplementare).toFixed(2));
          s.guadagnoTotaleLordo = Number((s.guadagnoBase + s.guadagnoNotturno + s.guadagnoFestivoDomenicale + s.guadagnoSupplementare).toFixed(2));
          s.guadagnoTotaleNettoStimato = Number((s.guadagnoTotaleLordo * (1 - aliquotaNetto / 100)).toFixed(2));
        }
      }
    }
  }

  // Riordiniamo la lista finale per mantenere l'ordine cronologico originario
  return finalShifts.sort((a, b) => {
    const timeDiff = new Date(a.dataGrezza).getTime() - new Date(b.dataGrezza).getTime();
    if (timeDiff !== 0) return timeDiff;
    return (a.orarioInizio || '').localeCompare(b.orarioInizio || '');
  });
}

