import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Calendar,
  Send,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Coffee,
  Umbrella,
  MessageCircle,
  FileImage,
  SlidersHorizontal,
} from 'lucide-react';
import { Shift, ContractConfig } from '../types';
import { checkDayTypeInfo } from '../utils/holidays';

interface ShareShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  currentMonthKey: string; // YYYY-MM
  config: ContractConfig;
  onShowNotification?: (msg: string) => void;
}

type PeriodOption = 'this_week' | 'next_week' | 'this_month';
type ThemeOption = 'dark' | 'light';

export const ShareShiftsModal: React.FC<ShareShiftsModalProps> = ({
  isOpen,
  onClose,
  shifts,
  currentMonthKey,
  config,
  onShowNotification,
}) => {
  const [period, setPeriod] = useState<PeriodOption>('this_week');
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [cardTheme, setCardTheme] = useState<ThemeOption>('dark');
  
  // Opzioni di personalizzazione
  const [includeHours, setIncludeHours] = useState<boolean>(true);
  const [includeShiftType, setIncludeShiftType] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(false);
  const [hideEarnings, setHideEarnings] = useState<boolean>(true); // default true per privacy
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calcola lunedì deterministico
  const getMondayIso = (dStr: string): string => {
    const [y, m, d] = dStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const day = date.getUTCDay();
    const diff = (day + 6) % 7; // Lunedì = 0
    date.setUTCDate(date.getUTCDate() - diff);
    return date.toISOString().split('T')[0];
  };

  const addDaysIso = (dStr: string, days: number): string => {
    const [y, m, d] = dStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
  };

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Mappa dei turni per data
  const shiftMap = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach((s) => {
      if (!map[s.dataGrezza]) map[s.dataGrezza] = [];
      map[s.dataGrezza].push(s);
    });
    return map;
  }, [shifts]);

  // Intervallo di date in base alla selezione
  const { dateList, periodLabel, fullPeriodTitle } = useMemo(() => {
    const days: string[] = [];
    let pLabel = '';
    let fTitle = '';

    const currentMonday = getMondayIso(todayIso);

    if (period === 'this_week') {
      for (let i = 0; i < 7; i++) {
        days.push(addDaysIso(currentMonday, i));
      }
      const start = new Date(days[0] + 'T00:00:00');
      const end = new Date(days[6] + 'T00:00:00');
      const startStr = `${start.getDate()} ${start.toLocaleDateString('it-IT', { month: 'short' })}`;
      const endStr = `${end.getDate()} ${end.toLocaleDateString('it-IT', { month: 'short' })}`;
      pLabel = `${startStr} - ${endStr}`;
      fTitle = `Settimana ${pLabel} ${end.getFullYear()}`;
    } else if (period === 'next_week') {
      const nextMonday = addDaysIso(currentMonday, 7);
      for (let i = 0; i < 7; i++) {
        days.push(addDaysIso(nextMonday, i));
      }
      const start = new Date(days[0] + 'T00:00:00');
      const end = new Date(days[6] + 'T00:00:00');
      const startStr = `${start.getDate()} ${start.toLocaleDateString('it-IT', { month: 'short' })}`;
      const endStr = `${end.getDate()} ${end.toLocaleDateString('it-IT', { month: 'short' })}`;
      pLabel = `${startStr} - ${endStr}`;
      fTitle = `Prossima Settimana (${pLabel} ${end.getFullYear()})`;
    } else {
      // this_month
      const [year, month] = currentMonthKey.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dPadded = String(d).padStart(2, '0');
        const mPadded = String(month).padStart(2, '0');
        days.push(`${year}-${mPadded}-${dPadded}`);
      }
      const monthDate = new Date(year, month - 1, 1);
      const mName = monthDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      pLabel = mName;
      fTitle = `Mese di ${mName.charAt(0).toUpperCase() + mName.slice(1)}`;
    }

    return { dateList: days, periodLabel: pLabel, fullPeriodTitle: fTitle };
  }, [period, todayIso, currentMonthKey]);

  // Calcola il tipo di turno (Mattina, Pomeriggio, Notte, Riposo, Ferie)
  const getShiftDetails = (dateIso: string) => {
    const dayShifts = shiftMap[dateIso] || [];
    const dayInfo = checkDayTypeInfo(dateIso);
    const dateObj = new Date(dateIso + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const dayShort = dayNames[dayOfWeek];

    if (dayShifts.length === 0) {
      return {
        hasShift: false,
        dayShort,
        dayNumber: dateObj.getDate(),
        dateIso,
        label: 'Riposo',
        badgeColor: 'slate',
        emoji: '🛋️',
        hoursText: '',
        isHoliday: dayInfo.isHoliday,
        holidayName: dayInfo.holidayName,
        isSunday: dayInfo.isSunday,
        notes: '',
        shifts: [],
      };
    }

    const first = dayShifts[0];
    const isFerie = first.tipoGiorno === 'ferie' || first.isFerie;

    if (isFerie) {
      return {
        hasShift: true,
        dayShort,
        dayNumber: dateObj.getDate(),
        dateIso,
        label: `Ferie (${first.oreTotali}h)`,
        badgeColor: 'amber',
        emoji: '🏖️',
        hoursText: 'Ferie',
        isHoliday: dayInfo.isHoliday,
        holidayName: dayInfo.holidayName,
        isSunday: dayInfo.isSunday,
        notes: first.note || '',
        shifts: dayShifts,
      };
    }

    // Calcolo tipo turno in base all'orario d'inizio
    const [startH] = first.orarioInizio.split(':').map(Number);
    let typeName = 'Turno';
    let emoji = '💼';
    let badgeColor = 'blue';

    if (first.oreNotturne >= 3 || startH >= 20 || startH <= 4) {
      typeName = 'Notte';
      emoji = '🌙';
      badgeColor = 'indigo';
    } else if (startH < 12) {
      typeName = 'Mattina';
      emoji = '🌅';
      badgeColor = 'amber';
    } else if (startH >= 12 && startH < 19) {
      typeName = 'Pomeriggio';
      emoji = '🌆';
      badgeColor = 'blue';
    }

    const hoursText = dayShifts.map(s => `${s.orarioInizio}-${s.orarioFine}`).join(' & ');
    const totalHours = dayShifts.reduce((acc, s) => acc + s.oreTotali, 0);

    return {
      hasShift: true,
      dayShort,
      dayNumber: dateObj.getDate(),
      dateIso,
      label: typeName,
      badgeColor,
      emoji,
      hoursText,
      totalHours,
      isHoliday: dayInfo.isHoliday,
      holidayName: dayInfo.holidayName,
      isSunday: dayInfo.isSunday,
      notes: dayShifts.map(s => s.note).filter(Boolean).join(' | '),
      shifts: dayShifts,
    };
  };

  // Genera il testo WhatsApp / Telegram formattato
  const whatsappText = useMemo(() => {
    const workerName = config.nomeLavoratore ? `👤 *${config.nomeLavoratore}*\n` : '';
    let text = `🗓️ *I MIEI TURNI* — ${fullPeriodTitle}\n${workerName}\n`;

    dateList.forEach((dateIso) => {
      const info = getShiftDetails(dateIso);
      const [y, m, d] = dateIso.split('-');
      const dateFormatted = `${info.dayShort} ${Number(d)}/${Number(m)}`;

      let line = `🔹 *${dateFormatted}:* `;

      if (!info.hasShift) {
        line += `${info.emoji} _Riposo_`;
        if (info.isHoliday && info.holidayName) {
          line += ` (🎉 ${info.holidayName})`;
        }
      } else if (info.hoursText === 'Ferie') {
        line += `${info.emoji} *FERIE*`;
      } else {
        line += `${info.emoji} `;
        if (includeHours) {
          line += `*${info.hoursText}* `;
        }
        if (includeShiftType) {
          line += `(${info.label})`;
        }
        if (info.isHoliday && info.holidayName) {
          line += ` 🎉 _${info.holidayName}_`;
        }
        if (includeNotes && info.notes) {
          line += ` 📝 "${info.notes}"`;
        }
      }

      text += line + '\n';
    });

    text += `\n✨ _Condiviso con Gestione Turni_`;
    return text;
  }, [dateList, fullPeriodTitle, config.nomeLavoratore, includeHours, includeShiftType, includeNotes]);

  // Generazione Card Grafica su Canvas
  useEffect(() => {
    if (!isOpen || activeTab !== 'image') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = cardTheme === 'dark';
    const width = 800;
    const headerHeight = 140;
    const rowHeight = 64;
    const footerHeight = 60;
    const totalHeight = headerHeight + dateList.length * rowHeight + footerHeight;

    // Retina 2x scale per estrema nitidezza
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalHeight}px`;

    ctx.scale(dpr, dpr);

    // Sfondo principale
    const bgGradient = ctx.createLinearGradient(0, 0, width, totalHeight);
    if (isDark) {
      bgGradient.addColorStop(0, '#0f172a'); // slate-900
      bgGradient.addColorStop(0.5, '#1e1b4b'); // indigo-950
      bgGradient.addColorStop(1, '#090d16');
    } else {
      bgGradient.addColorStop(0, '#f8fafc'); // slate-50
      bgGradient.addColorStop(1, '#e2e8f0'); // slate-200
    }
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, totalHeight, 28);
    ctx.fill();

    // Bordo esterno elegante
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(148, 163, 184, 0.4)';
    ctx.stroke();

    // Decorazione superiore sfumata
    const topGlow = ctx.createLinearGradient(0, 0, width, 0);
    topGlow.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    topGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.5)');
    topGlow.addColorStop(1, 'rgba(168, 85, 247, 0.4)');
    ctx.fillStyle = topGlow;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, 6, [28, 28, 0, 0]);
    ctx.fill();

    // ================= HEADER =================
    // Badge "ORARIO DI LAVORO"
    ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)';
    ctx.beginPath();
    ctx.roundRect(40, 28, 150, 26, 13);
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.4)' : 'rgba(37, 99, 235, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isDark ? '#93c5fd' : '#1d4ed8';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🗓️ I MIEI TURNI', 60, 45);

    // Titolo Periodo
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = '900 26px system-ui, -apple-system, sans-serif';
    ctx.fillText(fullPeriodTitle, 40, 85);

    // Nome Lavoratore o Sottotitolo
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    const subText = config.nomeLavoratore 
      ? `Lavoratore: ${config.nomeLavoratore} • Gestione Turni` 
      : 'Riepilogo turni di servizio e riposi';
    ctx.fillText(subText, 40, 110);

    // ================= LISTA GIORNI =================
    let currentY = headerHeight;

    dateList.forEach((dateIso, idx) => {
      const info = getShiftDetails(dateIso);
      const rowY = currentY;
      const isEven = idx % 2 === 0;

      // Sfondo riga
      ctx.fillStyle = isDark 
        ? (isEven ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.3)')
        : (isEven ? 'rgba(255, 255, 255, 0.7)' : 'rgba(241, 245, 249, 0.6)');
      ctx.beginPath();
      ctx.roundRect(32, rowY, width - 64, rowHeight - 8, 14);
      ctx.fill();

      // Bordo riga
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Badge giorno della settimana (LUN 13)
      const isSun = info.isSunday;
      const isHol = info.isHoliday;
      
      let badgeBg = isDark ? '#1e293b' : '#f1f5f9';
      let badgeText = isDark ? '#f8fafc' : '#0f172a';
      if (isHol) {
        badgeBg = isDark ? 'rgba(225, 29, 72, 0.25)' : 'rgba(255, 228, 230, 0.9)';
        badgeText = isDark ? '#f43f5e' : '#be123c';
      } else if (isSun) {
        badgeBg = isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 241, 242, 0.8)';
        badgeText = isDark ? '#fb7185' : '#e11d48';
      }

      ctx.fillStyle = badgeBg;
      ctx.beginPath();
      ctx.roundRect(44, rowY + 8, 90, 40, 10);
      ctx.fill();

      ctx.fillStyle = badgeText;
      ctx.font = '800 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${info.dayShort.toUpperCase()} ${info.dayNumber}`, 89, rowY + 33);

      // Emoji e Tipo Turno
      ctx.textAlign = 'left';
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillText(info.emoji, 150, rowY + 33);

      if (!info.hasShift) {
        // Riposo
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '600 14px system-ui, -apple-system, sans-serif';
        ctx.fillText('Riposo', 180, rowY + 32);

        if (info.isHoliday && info.holidayName) {
          ctx.fillStyle = isDark ? '#fda4af' : '#e11d48';
          ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
          ctx.fillText(`🎉 ${info.holidayName}`, 250, rowY + 32);
        }
      } else if (info.hoursText === 'Ferie') {
        // Ferie
        ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('🏖️ FERIE', 180, rowY + 32);
      } else {
        // Turno con Orari
        ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText(info.hoursText, 180, rowY + 32);

        // Badge Tipo (Mattina/Pomeriggio/Notte)
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '500 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`(${info.label})`, 310, rowY + 32);

        if (info.isHoliday && info.holidayName) {
          ctx.fillStyle = isDark ? '#f43f5e' : '#e11d48';
          ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
          ctx.fillText(`🎉 ${info.holidayName}`, 420, rowY + 32);
        }
      }

      // Note a destra (se presenti)
      if (includeNotes && info.notes) {
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = 'italic 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`📝 ${info.notes}`, width - 50, rowY + 32);
      }

      currentY += rowHeight;
    });

    // ================= FOOTER =================
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '500 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Generato con Gestione Turni • I miei orari personali', width / 2, totalHeight - 24);

  }, [isOpen, activeTab, cardTheme, dateList, fullPeriodTitle, config.nomeLavoratore, includeHours, includeShiftType, includeNotes]);

  // Gestione Copia Testo
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText);
      setCopied(true);
      if (onShowNotification) {
        onShowNotification('Testo turni copiato negli appunti!');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = whatsappText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      if (onShowNotification) {
        onShowNotification('Testo turni copiato negli appunti!');
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Apertura diretta WhatsApp
  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Apertura diretta Telegram
  const handleOpenTelegram = () => {
    const encoded = encodeURIComponent(whatsappText);
    const url = `https://t.me/share/url?url=&text=${encoded}`;
    window.open(url, '_blank');
  };

  // Condivisione nativa da mobile (Web Share API)
  const handleNativeShareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I miei turni - ${fullPeriodTitle}`,
          text: whatsappText,
        });
      } catch (err) {
        console.log('Condivisione annullata dall\'utente', err);
      }
    } else {
      handleCopyText();
    }
  };

  // Download Card Immagine PNG
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `turni-${periodLabel.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (onShowNotification) {
      onShowNotification('Immagine card salvata nei download!');
    }
  };

  // Condivisione Immagine via Web Share API
  const handleShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `turni-${periodLabel.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `I miei turni - ${fullPeriodTitle}`,
            text: `Ecco i miei turni per ${fullPeriodTitle}!`,
          });
        } catch (err) {
          console.log('Condivisione annullata', err);
        }
      } else {
        // Fallback: scarica l'immagine
        handleDownloadImage();
      }
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-hidden">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] transition-all overflow-hidden">
        
        {/* Header Modale */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
                Condividi i Tuoi Turni
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium">
                Invia orari e riposi su WhatsApp o salva la card per amici e familiari
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra di Configurazione: Periodo & Formato */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 space-y-3 shrink-0">
          {/* Selettore Periodo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPeriod('this_week')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  period === 'this_week'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Questa Settimana
              </button>
              <button
                type="button"
                onClick={() => setPeriod('next_week')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  period === 'next_week'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Prossima Settimana
              </button>
              <button
                type="button"
                onClick={() => setPeriod('this_month')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  period === 'this_month'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Questo Mese
              </button>
            </div>

            {/* Tab: Testo WhatsApp vs Card Immagine */}
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'text'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Testo WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'image'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>Card Grafica</span>
              </button>
            </div>
          </div>

          {/* Opzioni di privacy e visualizzazione */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHours}
                onChange={(e) => setIncludeHours(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Orari (es. 07:00-14:00)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeShiftType}
                onChange={(e) => setIncludeShiftType(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Tipo (Mattina/Pomeriggio/Notte)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Note</span>
            </label>

            <span className="ml-auto text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Privacy: Guadagni e importi esclusi
            </span>
          </div>
        </div>

        {/* Contenuto Principale: Preview */}
        <div className="p-3 sm:p-5 overflow-y-auto overscroll-contain flex-1 space-y-4">
          
          {/* VISTA 1: TESTO WHATSAPP */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Anteprima Messaggio WhatsApp & Telegram
                </span>
                <span className="text-slate-500 text-[11px]">Formattazione con grassetti ed emoji</span>
              </div>

              {/* Chat bubble stile WhatsApp */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-950 border border-emerald-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                {whatsappText}
              </div>

              {/* Pulsanti Azione Testo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs shadow-emerald-600/30 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Invia su WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-700 dark:text-emerald-400">Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copia Testo</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenTelegram}
                  className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs shadow-sky-500/30 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Invia su Telegram</span>
                </button>
              </div>
            </div>
          )}

          {/* VISTA 2: CARD GRAFICA HD */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-indigo-500" />
                  Anteprima Card Grafica HD
                </span>

                {/* Selettore Tema Card */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCardTheme('dark')}
                    className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                      cardTheme === 'dark'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-3 h-3 text-indigo-400" />
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('light')}
                    className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                      cardTheme === 'light'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                    Light
                  </button>
                </div>
              </div>

              {/* Canvas visualizzatore container con scroll orizzontale se necessario */}
              <div className="flex justify-center p-2 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <canvas
                  ref={canvasRef}
                  className="rounded-2xl shadow-xl max-w-full h-auto"
                />
              </div>

              {/* Pulsanti Azione Immagine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs shadow-blue-600/30 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Scarica Card PNG (Alta Risoluzione)</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareImage}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs shadow-emerald-600/30 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Condividi Card con WhatsApp / App</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
