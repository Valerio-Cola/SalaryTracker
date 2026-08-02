import { ContractConfig, Shift } from '../types';

/**
 * Esporta tutti i dati dell'applicazione in un file JSON scaricabile
 */
export function exportDataToJson(config: ContractConfig, shifts: Shift[]) {
  const exportPayload = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    config,
    shifts,
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

    return [
      `"${formattedDate}"`,
      `"${dayName}"`,
      `"${s.orarioInizio}"`,
      `"${s.orarioFine}"`,
      s.pausaMinuti,
      s.oreTotali.toString().replace('.', ','),
      s.oreNotturne.toString().replace('.', ','),
      s.oreSupplementari.toString().replace('.', ','),
      `"${s.tipoGiorno}"`,
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
  const rateiNettoMensili = rateiLordoMensili * (1 - (config.aliquotaNettoStimata || 15) / 100);

  const bonusRenziNetto = config.includeBonusRenzi ? (config.importoBonusRenzi ?? 98.63) : 0;

  const totalLordo = totalShiftsLordo + rateiLordoMensili;
  const totalNetto = totalShiftsNetto + rateiNettoMensili + bonusRenziNetto;

  const rowsHtml = sortedShifts
    .map((s) => {
      const d = new Date(s.dataGrezza + 'T00:00:00');
      const dateFormatted = d.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });
      return `
        <tr>
          <td><strong>${dateFormatted}</strong></td>
          <td>${s.orarioInizio} - ${s.orarioFine}</td>
          <td>${s.oreTotali.toFixed(2)} h</td>
          <td>${s.oreNotturne > 0 ? s.oreNotturne.toFixed(2) + ' h' : '-'}</td>
          <td>${s.oreSupplementari > 0 ? s.oreSupplementari.toFixed(2) + ' h' : '-'}</td>
          <td style="text-transform: capitalize;">${s.tipoGiorno}</td>
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
          <h1>🍔 Tracker Turni ${config.nomeAzienda || 'Burger King'}</h1>
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
            <th>Ore Notte (22-06)</th>
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
