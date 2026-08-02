/**
 * Utility per identificare le festività nazionali italiane e calcolare Pasqua/Pasquetta
 */

// Calcola la data di Pasqua per un dato anno (Algoritmo di Meeus/Jones/Butcher)
export function getEasterDate(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

export function getItalianHolidays(year: number): Record<string, string> {
  const holidays: Record<string, string> = {
    [`${year}-01-01`]: 'Capodanno',
    [`${year}-01-06`]: 'Epifania',
    [`${year}-04-25`]: 'Festa della Liberazione',
    [`${year}-05-01`]: 'Festa del Lavoro',
    [`${year}-06-02`]: 'Festa della Repubblica',
    [`${year}-08-15`]: 'Ferragosto (Assunzione)',
    [`${year}-11-01`]: 'Ognissanti',
    [`${year}-12-08`]: 'Immacolata Concezione',
    [`${year}-12-25`]: 'Natale',
    [`${year}-12-26`]: 'Santo Stefano',
  };

  // Calcolo Pasqua e Pasquetta
  const easter = getEasterDate(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);
  const easterStr = formatDateIso(easterDate);
  holidays[easterStr] = 'Pasqua';

  const pasquettaDate = new Date(year, easter.month - 1, easter.day + 1);
  const pasquettaStr = formatDateIso(pasquettaDate);
  holidays[pasquettaStr] = 'Lunedì dell\'Angelo (Pasquetta)';

  return holidays;
}

function formatDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Controlla se una data stringa (YYYY-MM-DD) è una festività nazionale o domenica
 */
export function checkDayTypeInfo(dateStr: string): {
  isSunday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  suggestedDayType: 'feriale' | 'domenica' | 'festivo';
} {
  if (!dateStr) {
    return { isSunday: false, isHoliday: false, suggestedDayType: 'feriale' };
  }

  const dateObj = new Date(dateStr + 'T00:00:00');
  const year = dateObj.getFullYear();
  const dayOfWeek = dateObj.getDay(); // 0 = Domenica

  const holidays = getItalianHolidays(year);
  const holidayName = holidays[dateStr];
  const isHoliday = Boolean(holidayName);
  const isSunday = dayOfWeek === 0;

  let suggestedDayType: 'feriale' | 'domenica' | 'festivo' = 'feriale';
  if (isHoliday) {
    suggestedDayType = 'festivo';
  } else if (isSunday) {
    suggestedDayType = 'domenica';
  }

  return {
    isSunday,
    isHoliday,
    holidayName,
    suggestedDayType,
  };
}
