import { ContractConfig, Shift, Expense, AppEvent } from '../types';

/**
 * Esporta tutti i dati dell'applicazione in un file JSON scaricabile
 */
export function exportDataToJson(
  config: ContractConfig,
  shifts: Shift[],
  expenses: Expense[] = [],
  events: AppEvent[] = []
) {
  const exportPayload = {
    version: '2.1',
    exportDate: new Date().toISOString(),
    config,
    shifts,
    expenses,
    events,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `stipendio_turni_backup_${new Date().toISOString().split('T')[0]}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Esporta i turni selezionati in formato CSV per Excel
 */
export function exportShiftsToCsv(shifts: Shift[], monthTitle: string = 'Turni') {
  if (shifts.length === 0) return;

  const headers = [
    'Data',
    'Giorno',
    'Orario Inizio',
    'Orario Fine',
    'Pausa (min)',
    'Ore Totali',
    'Ore Notturne',
    'Ore Straordinarie',
    'Tipo Giorno',
    'Note',
    'Paga Base (€)',
    'Bonus Notte (€)',
    'Bonus Fest/Dom (€)',
    'Bonus Straord (€)',
    'Totale Lordo (€)',
    'Stima Netto (€)',
  ];

  const rows = shifts.map((s) => {
    const d = new Date(s.dataGrezza + 'T00:00:00');
    const dayName = d.toLocaleDateString('it-IT', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('it-IT');

    const isFerie = s.tipoGiorno === 'ferie' || s.isFerie;
    return [
      `"${formattedDate}"`,
      `"${dayName}"`,
      isFerie ? '"Ferie"' : `"${s.orarioInizio}"`,
      isFerie ? '"Ferie"' : `"${s.orarioFine}"`,
      isFerie ? 0 : s.pausaMinuti,
      s.oreTotali.toString().replace('.', ','),
      s.oreNotturne.toString().replace('.', ','),
      s.oreSupplementari.toString().replace('.', ','),
      isFerie ? '"Ferie / ROL"' : `"${s.tipoGiorno}"`,
      `"${(s.note || '').replace(/"/g, '""')}"`,
      s.guadagnoBase.toString().replace('.', ','),
      s.guadagnoNotturno.toString().replace('.', ','),
      s.guadagnoFestivoDomenicale.toString().replace('.', ','),
      s.guadagnoSupplementare.toString().replace('.', ','),
      s.guadagnoTotaleLordo.toString().replace('.', ','),
      s.guadagnoTotaleNettoStimato.toString().replace('.', ','),
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Prospetto_Turni_${monthTitle.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Stampa un prospetto formattato del mese
 */
export function printMonthlyReport(
  shifts: Shift[],
  config: ContractConfig,
  monthName: string
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Consenti i popup per visualizzare la versione stampabile.');
    return;
  }

  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.dataGrezza).getTime() - new Date(b.dataGrezza).getTime()
  );

  const totalOre = sortedShifts.reduce((acc, curr) => acc + curr.oreTotali, 0);
  const totalNotte = sortedShifts.reduce((acc, curr) => acc + curr.oreNotturne, 0);
  const totalExtra = sortedShifts.reduce((acc, curr) => acc + curr.oreSupplementari, 0);
  const totalShiftsLordo = sortedShifts.reduce((acc, curr) => acc + curr.guadagnoTotaleLordo, 0);
  const totalShiftsNetto = sortedShifts.reduce((acc, curr) => acc + curr.guadagnoTotaleNettoStimato, 0);

  const rateo13 = config.includeTredicesimaMensile ? (config.importoTredicesimaMensile ?? 53.84) : 0;
  const rateo14 = config.includeQuattordicesimaMensile ? (config.importoQuattordicesimaMensile ?? 53.84) : 0;
  const rateiLordoMensili = rateo13 + rateo14;
  const taxRate = typeof config.aliquotaNettoStimata === 'number' ? config.aliquotaNettoStimata : 15;
  const rateiNettoMensili = rateiLordoMensili * (1 - taxRate / 100);

  const bonusRenziNetto = config.includeBonusRenzi ? (config.importoBonusRenzi ?? 98.63) : 0;
  const bonusL207Netto = config.includeBonusL207
    ? (config.modalitaBonusL207 === 'fisso'
        ? (config.importoBonusL207Fisso ?? 45.22)
        : Number(((totalShiftsLordo * (config.percentualeBonusL207 ?? 5.3)) / 100).toFixed(2)))
    : 0;

  const totalLordo = totalShiftsLordo + rateiLordoMensili;
  const totalNetto = totalShiftsNetto + rateiNettoMensili + bonusRenziNetto + bonusL207Netto;

  const rowsHtml = sortedShifts
    .map((s) => {
      const d = new Date(s.dataGrezza + 'T00:00:00');
      const dateFormatted = d.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });
      const isFerie = s.tipoGiorno === 'ferie' || s.isFerie;
      return `
        <tr>
          <td><strong>${dateFormatted}</strong></td>
          <td>${isFerie ? '🏖️ Ferie' : `${s.orarioInizio} - ${s.orarioFine}`}</td>
          <td>${s.oreTotali.toFixed(2)} h</td>
          <td>${s.oreNotturne > 0 ? s.oreNotturne.toFixed(2) + ' h' : '-'}</td>
          <td>${s.oreSupplementari > 0 ? s.oreSupplementari.toFixed(2) + ' h' : '-'}</td>
          <td style="text-transform: capitalize;">${isFerie ? 'Ferie / ROL' : s.tipoGiorno}</td>
          <td><strong>€ ${s.guadagnoTotaleLordo.toFixed(2)}</strong></td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>Prospetto Busta Paga - ${monthName}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1f2937; }
        .header { border-bottom: 2px solid #dc2626; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        h1 { margin: 0; color: #b91c1c; font-size: 24px; }
        .subtitle { color: #4b5563; font-size: 14px; margin-top: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; }
        .stat-box { text-align: center; }
        .stat-val { font-size: 20px; font-weight: bold; color: #991b1b; }
        .stat-lbl { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        th { background: #f3f4f6; color: #374151; font-weight: 600; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 30px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Tracker Turni${config.nomeAzienda ? ` • ${config.nomeAzienda}` : ''}</h1>
          <div class="subtitle">Prospetto ore e stima retribuzione: <strong>${monthName}</strong> ${config.nomeLavoratore ? `• Dipendente: ${config.nomeLavoratore}` : ''}</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #6b7280;">
          Generato il: ${new Date().toLocaleDateString('it-IT')}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-val">${totalOre.toFixed(2)} h</div>
          <div class="stat-lbl">Totale Ore Lavorate</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${totalNotte.toFixed(2)} h</div>
          <div class="stat-lbl">Ore Notturne</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${totalExtra.toFixed(2)} h</div>
          <div class="stat-lbl">Ore Straordinarie</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">€ ${totalLordo.toFixed(2)}</div>
          <div class="stat-lbl">Totale Lordo (Netto ~€ ${totalNetto.toFixed(2)})</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Orario Turno</th>
            <th>Ore Totali</th>
            <th>Ore Notte</th>
            <th>Straordinario</th>
            <th>Tipo Giorno</th>
            <th>Stima Lordo</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Documento generato da Calcolatore Stipendio Turni. Le cifre sono stime basate sulle tariffe orarie impostate.
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Esporta i turni del mese in formato iCalendar (.ics) compatibile al 100% con Google Calendar, Apple Calendar e Outlook
 */
export function exportShiftsToGoogleCalendar(shifts: Shift[], monthTitle: string = 'Turni') {
  if (shifts.length === 0) return;

  const pad = (n: number) => String(n).padStart(2, '0');

  const formatIcsDateTime = (dateStr: string, timeStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const [hh, mm] = timeStr.split(':');
    return `${y}${m}${d}T${hh}${mm}00`;
  };

  const formatIcsDateOnly = (dateStr: string) => {
    return dateStr.replace(/-/g, '');
  };

  const nowIcs = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const events = shifts.map((s) => {
    const isFerie = s.tipoGiorno === 'ferie' || s.isFerie;
    
    if (isFerie) {
      const [y, m, d] = s.dataGrezza.split('-');
      const nextDay = new Date(Number(y), Number(m) - 1, Number(d) + 1);
      const nextDayStr = `${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
      const dtStart = formatIcsDateOnly(s.dataGrezza);
      
      return [
        'BEGIN:VEVENT',
        `UID:${s.id || Date.now()}_ferie@salarytracker`,
        `DTSTAMP:${nowIcs}`,
        `DTSTART;VALUE=DATE:${dtStart}`,
        `DTEND;VALUE=DATE:${nextDayStr}`,
        'SUMMARY:🏖️ Ferie / ROL',
        `DESCRIPTION:Giorno di Ferie (${s.oreTotali}h). Stima Lordo: €${Math.round(s.guadagnoTotaleLordo)}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n');
    }

    const dtStart = formatIcsDateTime(s.dataGrezza, s.orarioInizio);
    
    // Gestione turni a cavallo di mezzanotte (es. 22:00 -> 06:00)
    let endDateStr = s.dataGrezza;
    if (s.orarioFine < s.orarioInizio) {
      const [y, m, d] = s.dataGrezza.split('-');
      const nextDay = new Date(Number(y), Number(m) - 1, Number(d) + 1);
      endDateStr = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;
    }
    const dtEnd = formatIcsDateTime(endDateStr, s.orarioFine);

    const description = [
      `Turno di lavoro: ${s.orarioInizio} - ${s.orarioFine} (${s.oreTotali}h)`,
      s.pausaMinuti > 0 ? `Pausa: ${s.pausaMinuti} min` : '',
      s.oreNotturne > 0 ? `Ore Notte: ${s.oreNotturne}h` : '',
      s.oreSupplementari > 0 ? `Straordinario: ${s.oreSupplementari}h` : '',
      `Compenso Lordo Stimato: €${s.guadagnoTotaleLordo.toFixed(2)}`,
      s.note ? `Note: ${s.note}` : '',
    ].filter(Boolean).join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:${s.id || Date.now()}@salarytracker`,
      `DTSTAMP:${nowIcs}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Turno ${s.orarioInizio} - ${s.orarioFine}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Salary Tracker SK//Turni Lavorativi//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Turni ${monthTitle}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Turni_${monthTitle.replace(/\s+/g, '_')}_Google_Calendar.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
