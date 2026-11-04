import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Clock,
  Coins,
  Palmtree,
  Calendar,
  Cloud,
  Receipt,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Printer,
  FileSpreadsheet,
  FileCode2,
  Download,
  Upload,
  TrendingUp,
  MapPin,
  CalendarDays,
  Target,
} from 'lucide-react';
import { useDraggableScroll } from '../utils/useDraggableScroll';
import { useModalAnimation } from '../utils/useModalAnimation';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'turni' | 'eventi' | 'spese' | 'bonus' | 'ferie' | 'tariffe' | 'export' | 'cloud';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('turni');
  const { scrollProps, isGrabbing } = useDraggableScroll();

  const { triggerClose, backdropClasses, cardAnimationClasses } = useModalAnimation({
    isOpen,
    onClose,
    exitDuration: 220,
    lockScroll: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
      {/* Sfondo oscurato con transizione progressiva e sfocatura graduale */}
      <div 
        className={backdropClasses}
        aria-hidden="true"
        onClick={triggerClose}
      />

      <div 
        className={`relative bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto sm:my-6 flex flex-col max-h-[85vh] ${cardAnimationClasses}`}
      >
        {/* Header Modal - Stesso gradiente elegante */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20 shadow-inner flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guida & Aiuto Salary Tracker</h2>
              <p className="text-xs text-slate-300">
                Tutto quello che c'è da sapere per gestire turni, stipendio, eventi, ferie e stampe
              </p>
            </div>
          </div>
          <button
            onClick={triggerClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Scorrevole con Rotella, Drag & Drop e Scrollbar visibile */}
        <div
          {...scrollProps}
          className={`flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 overflow-x-auto shrink-0 px-3 pt-2.5 pb-1 gap-1.5 text-xs sm:text-[13px] font-semibold select-none ${
            isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
          } scrollbar-thin [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.6)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-200/50 dark:[&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/80 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-500`}
        >
          <button
            onClick={() => setActiveTab('turni')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'turni'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Turni & Orari
          </button>

          <button
            onClick={() => setActiveTab('eventi')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'eventi'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Eventi & Agenda
          </button>

          <button
            onClick={() => setActiveTab('spese')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'spese'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Spese & Bilancio
          </button>

          <button
            onClick={() => setActiveTab('bonus')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'bonus'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            Bonus & Busta Paga
          </button>

          <button
            onClick={() => setActiveTab('ferie')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'ferie'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palmtree className="w-4 h-4" />
            Ferie & Saldo
          </button>

          <button
            onClick={() => setActiveTab('tariffe')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'tariffe'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Tariffe & Contratto
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            Stampa & Backup
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Cloud & Sync
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* TAB 1: TURNI & ORARI */}
          {activeTab === 'turni' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Come registrare un turno di lavoro
                </h3>
                <p>
                  Per inserire un turno ti basta cliccare su un qualsiasi giorno del <strong>Calendario</strong> o sul pulsante rapido <strong>&quot;Nuovo Turno&quot;</strong>.
                  Inserisci l&apos;orario di entrata, l&apos;orario di uscita e gli eventuali minuti di pausa (es. 15 o 30 minuti).
                </p>
              </div>

              {/* Box Calcolo Obiettivo Contrattuale (~104h per 24h/settimana) */}
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-2">
                <div className="font-bold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>🎯 Perché con 24h settimanali l&apos;obiettivo mensile è di ~104h?</span>
                </div>
                <p className="text-[11.5px] text-emerald-900 dark:text-emerald-300 leading-relaxed">
                  Nei contratti di lavoro e nei CCNL italiani, un mese non è mai formato da 4 settimane esatte (4 settimane corrispondono a soli 28 giorni, mentre i mesi hanno 30 o 31 giorni).
                </p>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800 text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    La formula contrattuale standard applicata anche dai consulenti del lavoro:
                  </p>
                  <code className="block p-1.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                    52 settimane all&apos;anno / 12 mesi = 4,333 settimane al mese
                  </code>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Moltiplicando le ore settimanali del tuo contratto per il coefficiente mensile:
                    <br />
                    • <strong>24 ore/settimana × 4,333 = 103,99 ore</strong> (arrotondato a <strong>~104h</strong>).
                    <br />
                    • <strong>40 ore/settimana × 4,333 = 173,33 ore</strong> (arrotondato a <strong>~173h</strong>).
                  </p>
                </div>
              </div>

              {/* Box Vista Settimanale vs Mensile */}
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-1.5">
                <div className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>🗓️ Vista Mensile e Nuova Vista Settimanale</span>
                </div>
                <p className="text-[11.5px] text-indigo-900 dark:text-indigo-300 leading-relaxed">
                  In cima al calendario puoi scegliere tra visualizzazione <strong>Mese</strong> o <strong>Settimana</strong>:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li><strong>Vista Settimanale:</strong> Mostra le singole giornate in colonne dedicate e calcola in tempo reale la <em>barra dei totali settimanali</em>: ore lavorate, straordinari, ore notturne e guadagno lordo maturato in quella specifica settimana.</li>
                  <li><strong>Targhette compatte e intuitive:</strong> Gli orari di lavoro vanno a capo automaticamente sul trattino (<code>-</code>) per non occupare spazio; le ore totali hanno l&apos;icona delle monete, gli straordinari mostrano solo il simbolo <code>📈</code> e le ore (es. <em>📈 2h</em>), le ore notturne mostrano solo il simbolo <code>🌙</code> e le ore (es. <em>🌙 2h</em>), mentre il guadagno in euro è allineato a destra.</li>
                </ul>
              </div>

              {/* Straordinari e Notte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    🌙 <span>Turni Notturni Automatici</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    L&apos;app rileva e conteggia automaticamente i minuti notturni esatti applicando la maggiorazione. Nella scheda <strong>Tariffe</strong> puoi personalizzare l&apos;orario di inizio e di fine notte stabilito dal tuo CCNL (es. 22:00-06:00).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    📈 <span>Straordinari Contrattuali</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Ogni ora eccedente il monte ore contrattuale settimanale (es. 24h) viene riconosciuta e maggiorata con la percentuale prevista dal tuo contratto.
                  </p>
                </div>
              </div>

              {/* Box Dedicato: Perché a fine mese potrei vedere meno straordinari o notturni? (Settimana a cavallo) */}
              <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2">
                <div className="font-bold text-sm text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>💡 Perché nel cedolino mensile potrei vedere meno straordinari o notturni? (Settimana a cavallo)</span>
                </div>
                <p className="text-[11.5px] text-amber-900 dark:text-amber-300 leading-relaxed">
                  Se a fine mese noti che le ore di straordinario o di notturno del mese sono inferiori a quelle che ti aspettavi, <strong>è dovuto alla settimana spezzata tra due mesi</strong>.
                </p>
                <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800 text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Come funziona la regola contrattuale (CCNL e software paghe):
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                    <li>La settimana lavorativa contrattuale va rigorosamente <strong>da Lunedì a Domenica</strong>.</li>
                    <li>Quando l&apos;ultima settimana del mese scavalca nel mese successivo e <strong>lavori almeno un giorno anche nel secondo mese</strong>, l&apos;intero computo degli straordinari e delle maggiorazioni notturne settimanali viene attribuito al <strong>cedolino del mese successivo</strong>, mese in cui la settimana giunge a conclusione.</li>
                    <li><strong>Nessuna ora va persa:</strong> nel mese attuale le ore lavorate a fine mese vengono comunque liquidate per intero come retribuzione ordinaria base; il supplemento di maggiorazione per straordinario e per lavoro notturno ti verrà accreditato nella busta paga successiva.</li>
                    <li><strong>Se invece non svolgi alcun turno nel mese successivo</strong> durante la stessa settimana a cavallo, sia gli straordinari sia le ore notturne restano accreditati nel mese corrente.</li>
                  </ul>
                </div>
              </div>

              {/* Preset Rapidi */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>⏰ Preset di Orario Preimpostati</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Nella finestra del turno puoi cliccare direttamente sui tuoi <strong>preset rapidi</strong> (es. <em>Apertura</em>, <em>Turno Pranzo</em>, <em>Chiusura Notte</em>) per compilare all&apos;istante tutti i campi. Puoi crearne di nuovi dalla scheda <strong>Tariffe &gt; Preset Orari</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTI & AGENDINA (NUOVA SCHEDA COMPLETA) */}
          {activeTab === 'eventi' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Calendario Bi-Funzione: Gestione Eventi &amp; Impegni
                </h3>
                <p>
                  Salary Tracker include un calendario integrato per appuntamenti personali, scadenze, visite mediche o impegni di lavoro, permettendoti di avere tutta la tua vita organizzata in un unico posto.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span>1. Come passare da Turni a Eventi</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Sopra al calendario trovi il selettore bi-funzione: premi <strong>&quot;Eventi&quot;</strong> per visualizzare i tuoi impegni. In questa modalità, ogni giorno mostra gli eventi con la loro etichetta colorata, orario e luogo. Inoltre, se quel giorno lavori, vedrai un promemoria discreto con il tuo turno per evitare doppie prenotazioni.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>2. Creazione Evento, Orari e Tutto il Giorno</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Cliccando su un giorno o su <em>&quot;Nuovo Evento&quot;</em> puoi specificare un orario di inizio e fine, oppure attivare la spunta <strong>&quot;Tutto il giorno&quot;</strong> per compleanni o ricorrenze. Gli orari nel calendario vanno a capo automaticamente dopo il trattino (<code>-</code>) per non essere mai tagliati.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>3. Categorie con Emoji e Colori Personalizzati</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Puoi classificare gli eventi con categorie pronte (<em>Lavoro</em>, <em>Personale</em>, <em>Scadenza</em>, <em>Salute</em>, <em>Svago</em>, <em>Commissioni</em>) o <strong>creare le tue categorie personalizzate</strong> scegliendo emoji e colori. È disponibile sia una palette di colori pastello sia un selettore di colore esadecimale (HEX) libero.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>4. Scheda Agenda &amp; Countdown in tempo reale</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Quando la modalità Eventi è attiva, il riassunto superiore del calendario si trasforma nella card <strong>Agenda</strong>: mette in primo piano il prossimo evento imminente con badge dinamico (<em>&quot;Oggi!&quot;</em>, <em>&quot;Domani&quot;</em>, <em>&quot;Fra X giorni&quot;</em>) e consente di filtrare gli impegni per categoria.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPESE & BILANCIO (NUOVA SCHEDA COMPLETA) */}
          {activeTab === 'spese' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Gestione Spese, Uscite e Bilancio Reale
                </h3>
                <p>
                  Oltre a calcolare lo stipendio guadagnato, l&apos;app ti consente di registrare le tue uscite quotidiane per sapere esattamente quanto denaro ti rimane a fine mese.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-rose-500" />
                    <span>1. Come inserire una spesa</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Puoi toccare l&apos;icona dello scontrino <strong>🧾 (Ricevuta)</strong> presente in hover su ogni casella del calendario, oppure premere il pulsante <strong>&quot;Aggiungi Spesa&quot;</strong> nella barra superiore o nella sezione Spese.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    <span>2. Calcolo del Saldo Netto Reale</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Nel riepilogo mensile in cima alla pagina, il terzo box indica il totale delle <strong>Uscite Registrate</strong> e calcola automaticamente:
                    <br />
                    <code className="inline-block mt-1 p-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-900 dark:text-white font-mono text-[11px]">
                      Saldo Netto Disponibile = Stipendio Netto Stimato - Totale Spese del Mese
                    </code>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                    <span>3. Categorie ed Esportazione</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Le spese sono suddivise per categoria (<em>Cibo</em>, <em>Trasporti</em>, <em>Utenze</em>, <em>Salute</em>, <em>Svago</em>, <em>Altro</em>) e vengono incluse nel backup JSON e nei report mensili esportati.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BONUS & BUSTA PAGA */}
          {activeTab === 'bonus' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  I Bonus in Busta Paga (100% Netto Esente)
                </h3>
                <p>
                  In Italia esistono bonus che <strong>non sono soggetti a tasse (IRPEF/INPS)</strong> e vengono accreditati direttamente come netto in busta paga.
                </p>
              </div>

              {/* Bonus L. 207/2024 */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2">
                <div className="font-bold text-sm text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Voce &quot;SOMMA ART.1 C.4 L.207/24&quot; (Legge di Bilancio 2025)
                </div>
                <p className="text-[11px] text-amber-900 dark:text-amber-300">
                  È il nuovo bonus introdotto dalla Legge di Bilancio 2025 che sostituisce il precedente &quot;taglio del cuneo fiscale&quot;. 
                  È <strong>totalmente esente da contributi e imposte</strong> (non fa cumulo con il reddito).
                </p>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800 text-[11px] space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Come funziona:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    <li>Spetta ai dipendenti con reddito annuo complessivo fino a 20.000 euro.</li>
                    <li><strong>7,1%</strong> se il reddito annuo non supera gli 8.500 euro.</li>
                    <li><strong>5,3%</strong> se il reddito è tra 8.501 e 15.000 euro (es. contratti part-time con imponibile ~911€ genera la quota di ~45,22€).</li>
                    <li><strong>4,8%</strong> se il reddito è compreso tra 15.001 e 20.000 euro.</li>
                  </ul>
                  <p className="text-slate-500 dark:text-slate-400 italic pt-1">
                    Puoi impostare il calcolo percentuale automatico oppure inserire la quota fissa presente nel tuo cedolino (es. €45,22) dalla sezione Tariffe!
                  </p>
                </div>
              </div>

              {/* Bonus Renzi */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Trattamento Integrativo (Bonus Renzi ~€98,63)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  È un credito d&apos;imposta netto riconosciuto dallo Stato. Se abilitato nelle Tariffe, viene aggiunto interamente al tuo netto mensile senza subire trattenute.
                </p>
              </div>

              {/* Voci personalizzate */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Voci &amp; Bonus Personalizzabili in Busta</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Hai indennità particolari come &quot;Indennità Cassa&quot;, &quot;Buoni Pasto / Ticket Restaurant&quot;, &quot;Premio Presenza&quot; o rimborsi spese? Nella sezione <strong>Tariffe &gt; Bonus</strong> puoi aggiungerle impostando un <strong>accredito mensile fisso</strong> oppure a cadenza periodica (<strong>ogni tot mesi</strong>, es. bimestrale, trimestrale o semestrale) con anteprima automatica dei mesi di paga!
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: FERIE & SALDO */}
          {activeTab === 'ferie' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Palmtree className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Calcolo e Gestione delle Ferie
                </h3>
                <p>
                  L&apos;app monitora costantemente i giorni di ferie che hai accumulato e quelli che hai già utilizzato.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    1. Come maturano le ferie?
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Il sistema rileva la data del tuo <strong>turno più vecchio</strong> e la data del tuo <strong>turno più recente</strong> per calcolare esattamente quanti mesi hai lavorato. Ogni mese maturi un numero stabilito di giorni di ferie (di default <strong>2,16 giorni/mese</strong>, modificabile a piacimento nelle Tariffe).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    2. Come registrare un giorno di ferie?
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Quando ti assenti per ferie, apri la finestra di inserimento turno e seleziona il pulsante <strong>&quot;Ferie / Permesso&quot;</strong> (icona spiaggia 🏖️). Il giorno verrà segnato sul calendario e contato automaticamente tra le ferie godute con la relativa quota economica.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    3. Saldo Ferie Rimanenti
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Il totale delle ferie residue è dato dalla formula:
                    <br />
                    <code className="inline-block mt-1 p-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-900 dark:text-white font-mono text-[11px]">
                      Ferie Residue = (Mesi Lavorati × Giorni Maturati al Mese) + Saldo Iniziale - Giorni Goduti
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TARIFFE & CONTRATTO */}
          {activeTab === 'tariffe' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Tariffe, CCNL e Maggiorazioni Orarie
                </h3>
                <p>
                  Puoi personalizzare ogni singolo parametro cliccando sul pulsante <strong>&quot;Tariffe&quot;</strong> nella barra superiore.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>📑 Indice Cliccabile Rapido</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    In cima alla schermata delle Tariffe trovi un comodo <strong>indice cliccabile</strong> (Paga Base, Maggiorazioni, Maggiorazioni Orarie Personalizzate, 13ª/14ª, Ferie, Voci Extra, Preset Orari e Reset) per saltare istantaneamente alla sezione che ti interessa con un tocco.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>⚡ Maggiorazioni Orarie Personalizzate</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Il tuo contratto prevede un extra all&apos;ora per mansioni particolari (es. <em>Turno Spezzato +€1,50/h</em>, <em>Indennità Reperibilità +€2,00/h</em>, <em>Lavoro Pomeridiano</em>)? Nelle Tariffe puoi creare maggiorazioni orarie libere (in percentuale o importo fisso) e decidere se applicarle a tutti i turni o spuntarle singolarmente.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>🌙 Fascia Notturna Personalizzata</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Puoi impostare l&apos;orario esatto di inizio e di fine della notte previsto dal tuo CCNL (es. 22:00-06:00, 23:00-07:00 o 20:00-04:00). L&apos;algoritmo calcolerà i minuti notturni esatti anche a cavallo di mezzanotte.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Tredicesima e Quattordicesima: Ratei Mensili vs Soluzione Unica
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Puoi scegliere se ricevere 13ª e 14ª a <strong>rate mensili</strong> (1/12 ogni mese in busta paga), oppure in <strong>unica soluzione annuale</strong> (a Dicembre per la 13ª e a Giugno/Luglio per la 14ª) così da rispecchiare fedelmente il tuo cedolino paga effettivo.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Giorni Festivi Nazionali Italiani
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Nel calendario, tutti i <strong>giorni festivi nazionali</strong> (Capodanno, Epifania, Pasqua, Pasquetta, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, Ognissanti, 8 Dicembre, Natale, Santo Stefano) sono evidenziati con il <strong>numero rosso</strong> e la relativa maggiorazione economica festiva.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STAMPA & BACKUP */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Stampa, Google Calendar, CSV &amp; Backup JSON
                </h3>
                <p>
                  Dalla barra in alto, toccando l&apos;icona della <strong>Stampante (Stampa ed Esporta)</strong> puoi scaricare i tuoi turni in diversi formati o creare un backup di sicurezza.
                </p>
              </div>

              {/* Box 1: Come Importare su Google Calendar */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-blue-950 dark:text-blue-200">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">Come importare i turni su Google Calendar &amp; Apple</h4>
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Sincronizzazione su PC, Mac, Android e iPhone</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-200/80 dark:border-blue-900/50 space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                      💻 Procedura da Computer (Web):
                    </strong>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      <li>Tocca <strong>Stampa</strong> nella barra in alto e seleziona <strong>&quot;Google Calendar (File .ics)&quot;</strong>.</li>
                      <li>Verrà scaricato un file <code>.ics</code> con tutti i tuoi turni ed orari del mese.</li>
                      <li>Apri <strong>Google Calendar</strong> (calendar.google.com) &gt; Ingranaggio ⚙️ &gt; <strong>&quot;Impostazioni&quot;</strong>.</li>
                      <li>Nel menu a sinistra premi <strong>&quot;Importazione ed esportazione&quot;</strong>, scegli il file <code>.ics</code> e clicca su <strong>&quot;Importa&quot;</strong>.</li>
                    </ol>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-200/80 dark:border-blue-900/50 space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                      📱 Procedura da Smartphone (Android &amp; iPhone):
                    </strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      Scarica il file <code>.ics</code>, tocca la notifica di download o apri il file: il telefono ti chiederà automaticamente di aprirlo con l&apos;app Calendario (Google o Apple) inserendo tutti i turni con relativi orari e promemoria!
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 2: Backup JSON */}
              <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <FileCode2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">Come eseguire e ripristinare il Backup JSON</h4>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">Backup completo di turni, eventi, spese, tariffe e preset</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-200/80 dark:border-purple-900/50 space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                      💾 Salvataggio e Ripristino:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      Da <strong>Stampa &gt; &quot;Backup Completo (JSON)&quot;</strong> puoi salvare un file con l&apos;intero archivio. Per ripristinarlo su un nuovo dispositivo o browser, premi <strong>&quot;Ripristina Backup da file JSON&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 3: PDF e CSV */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>Stampa o Salva PDF</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Genera un documento A4 pulito con riepilogo ore lavorate, totali notturni/festivi, straordinari e stima netto, pronto per la stampa o l&apos;archiviazione.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>File CSV per Excel</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Esporta tutti i dati in formato tabellare compatibile con Microsoft Excel, Google Fogli o Apple Numbers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CLOUD & SYNC */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Sincronizzazione Cloud Multi-Dispositivo
                </h3>
                <p>
                  Non rischiare di perdere i tuoi dati e consulta i turni e gli impegni su qualunque dispositivo (smartphone, tablet o PC).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Come collegare il tuo account</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    1. Clicca sull&apos;icona della <strong>Nuvola (Cloud)</strong> in alto a destra.<br />
                    2. Inserisci il tuo <strong>Nome Utente</strong> e la tua <strong>Password</strong> personale rilasciati dall&apos;amministratore.<br />
                    3. Supera la rapida verifica di sicurezza e clicca su <strong>&quot;Accedi e Sincronizza&quot;</strong>.<br />
                    4. Da quel momento, ad ogni modifica (nuovo turno, spesa, evento o cambio tariffe), l&apos;app salverà i tuoi dati in tempo reale sul cloud protetto con database Cloudflare D1!
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1.5 text-[11px] text-amber-950 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-100">
                    <span>🔐 Accesso Riservato &amp; Donazioni Ko-fi</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Il cloud è un servizio ad accesso privato, riservato esclusivamente agli utenti autorizzati (senza registrazione pubblica).
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Il supporto o tipping tramite <strong>Ko-fi</strong> è una donazione del tutto libera e spontanea: non costituisce compravendita di servizi o canone per l&apos;account e <strong>non preclude né condiziona in alcun modo la possibilità di ottenere un account</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Salary Tracker SK • Assistenza e Guida Rapida
          </span>
          <button
            onClick={triggerClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Ho capito, chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
