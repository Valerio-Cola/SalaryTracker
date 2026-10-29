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
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'turni' | 'tariffe' | 'bonus' | 'ferie' | 'export' | 'cloud';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('turni');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors flex flex-col max-h-[85vh]">
        {/* Header Modal - Stesso gradiente elegante */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20 shadow-inner flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guida & Aiuto Salary Tracker</h2>
              <p className="text-xs text-slate-300">
                Tutto quello che c'è da sapere per calcolare stipendio, turni, ferie ed esportazioni
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 overflow-x-auto no-scrollbar shrink-0 px-2 pt-2 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('turni')}
            className={`px-3 py-2 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'turni'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Turni & Orari
          </button>

          <button
            onClick={() => setActiveTab('bonus')}
            className={`px-3 py-2 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bonus'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Bonus & Busta Paga
          </button>

          <button
            onClick={() => setActiveTab('ferie')}
            className={`px-3 py-2 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ferie'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palmtree className="w-3.5 h-3.5" />
            Ferie & Saldo
          </button>

          <button
            onClick={() => setActiveTab('tariffe')}
            className={`px-3 py-2 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tariffe'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Tariffe & Bonus
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-2 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Stampa, Calendar & Backup
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-2 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Cloud & Sync
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeTab === 'turni' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Come inserire un turno
                </h3>
                <p>
                  Per inserire un turno ti basta cliccare su un qualsiasi giorno del <strong>Calendario</strong> o sul pulsante <strong>"Nuovo Turno"</strong>.
                  Inserisci l'orario di entrata, l'orario di uscita e gli eventuali minuti di pausa (es. 15 o 30 minuti).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    🌙 <span>Turni Notturni Automatici</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    L'app rileva e conteggia automaticamente i minuti notturni esatti applicando la maggiorazione prevista. Nella scheda <strong>Tariffe</strong> puoi personalizzare la fascia oraria notturna inserendo l'orario esatto di inizio e di fine notte stabilito dal tuo CCNL aziendale.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    📈 <span>Straordinari Settimanali</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Ogni ora lavorata oltre il monte ore settimanale (es. 24h a settimana) viene riconosciuta come lavoro supplementare/straordinario con la relativa tariffa extra.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-1">
                <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1">
                  ⚡ <span>Settimana a cavallo di due mesi</span>
                </div>
                <p className="text-[11px] text-emerald-900 dark:text-emerald-300">
                  Se una settimana inizia in un mese (es. Lunedì-Martedì 30-31 Agosto) e termina nel mese successivo (Mercoledì-Domenica a Settembre), il sistema conteggia le ore di tutta la settimana e <strong>attribuisce correttamente gli straordinari alla busta paga del nuovo mese</strong>, proprio come fa il consulente del lavoro!
                </p>
              </div>

              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-2">
                <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>⏰ Preset di Orari Rapidi & Personalizzabili</span>
                </div>
                <p className="text-[11px] text-indigo-900 dark:text-indigo-300 leading-relaxed">
                  Fai spesso gli stessi orari (es. <em>Apertura</em>, <em>Turno Pranzo</em>, <em>Chiusura Notte</em>)?
                  Nella finestra del turno puoi cliccare direttamente sui tuoi <strong>preset rapidi</strong> per compilare all&apos;istante orario di entrata, orario di uscita, pausa e note, senza doverli digitare ogni volta.
                </p>
                <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <strong className="block text-indigo-950 dark:text-indigo-200 font-semibold">Come creare i tuoi preset su misura:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    <li>Apri il menu <strong>&quot;Tariffe&quot;</strong> nella barra superiore e clicca su <strong>&quot;Preset Orari&quot;</strong> nell&apos;indice.</li>
                    <li>Digita il nome del modello (es. <em>&quot;Apertura Bar&quot;</em>, <em>&quot;Turno Spezzato&quot;</em>), seleziona gli orari e la pausa.</li>
                    <li>Clicca su <strong>&quot;Salva Preset&quot;</strong>: il tuo nuovo orario comparirà subito fra i pulsanti di scelta rapida!</li>
                    <li>Puoi gestire, eliminare o ripristinare i modelli predefiniti in qualsiasi momento.</li>
                  </ul>
                </div>
              </div>

              {/* Calendario Bi-Funzione e Gestione Eventi */}
              <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-2">
                <div className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>🎯 Calendario Bi-Funzione: Turni & Eventi</span>
                </div>
                <p className="text-[11px] text-purple-900 dark:text-purple-300 leading-relaxed">
                  Il calendario ti permette di passare in ogni momento dalla visualizzazione <strong>&quot;Turni di lavoro&quot;</strong> alla visualizzazione <strong>&quot;Eventi&quot;</strong> (sia in vista Mensile che Settimanale):
                </p>
                <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-purple-200 dark:border-purple-800 text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    <li><strong>Box Prossimo Evento & Countdown:</strong> Quando attivi la vista Eventi, il riepilogo superiore si trasforma nell&apos;Agenda con il countdown in tempo reale (<em>&quot;Oggi!&quot;</em>, <em>&quot;Domani&quot;</em>, <em>&quot;Fra X giorni&quot;</em>).</li>
                    <li><strong>Categorie & Colori:</strong> Assegna categorie (Lavoro, Personale, Scadenza, Salute, Svago, Commissioni) ed etichette colorate.</li>
                    <li><strong>Incrocio Turni/Eventi:</strong> In vista Eventi vedrai comunque un promemoria discreto con il tuo turno di lavoro, così da organizzare appuntamenti senza sovrapposizioni.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

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
                  Voce "SOMMA ART.1 C.4 L.207/24" (Legge di Bilancio 2025)
                </div>
                <p className="text-[11px] text-amber-900 dark:text-amber-300">
                  È il nuovo bonus introdotto dalla Legge di Bilancio 2025 che sostituisce il precedente "taglio del cuneo fiscale". 
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
                  È un credito d'imposta netto riconosciuto dallo Stato. Se abilitato nelle Tariffe, viene aggiunto interamente al tuo netto mensile senza subire trattenute.
                </p>
              </div>

              {/* Voci personalizzate */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Voci & Bonus Personalizzabili in Busta</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Hai indennità particolari come "Indennità Cassa", "Buoni Pasto / Ticket Restaurant", "Premio Presenza" o rimborsi spese? Nella sezione <strong>Tariffe &gt; Bonus</strong> puoi aggiungerle impostando un <strong>accredito mensile fisso</strong> oppure a cadenza periodica (<strong>ogni tot mesi</strong>, es. bimestrale, trimestrale o semestrale) con anteprima automatica dei mesi di paga!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ferie' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Palmtree className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Calcolo e Gestione delle Ferie
                </h3>
                <p>
                  L'app monitora costantemente i giorni di ferie che hai accumulato e quelli che hai già utilizzato.
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
                    Quando ti assenti per ferie, apri la finestra di inserimento turno e seleziona il pulsante <strong>"Ferie / Permesso"</strong> (icona spiaggia 🏖️). Il giorno verrà segnato sul calendario e contato automaticamente tra le ferie godute.
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

          {activeTab === 'tariffe' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Tariffe, Contratto e Mensilità Aggiuntive
                </h3>
                <p>
                  Puoi personalizzare ogni singolo parametro cliccando sul pulsante <strong>"Tariffe"</strong> nella barra superiore.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>📑 Indice Cliccabile Rapido</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    In cima alla schermata delle Tariffe trovi un comodo <strong>indice cliccabile</strong> (Paga Base, Maggiorazioni, 13ª/14ª, Ferie, Voci Extra, Preset Orari e Reset) che ti consente di saltare istantaneamente alla sezione che ti interessa con un tocco, senza dover scorrere tutta la schermata.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>⏰ Gestione dei Preset di Orario</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Nella sezione <strong>&quot;Preset Orari&quot;</strong> delle Tariffe puoi visualizzare i modelli già attivi, eliminare quelli obsoleti e aggiungerne di nuovi impostando orario di inizio, orario di fine, minuti di pausa e mansione/note. L&apos;anteprima calcola subito la durata effettiva e le ore notturne comprese.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Tredicesima e Quattordicesima: Come le ricevi?
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Molti lavoratori prendono la 13ª e la 14ª a <strong>rate mensili</strong> (1/12 ogni mese in busta paga), mentre altri le ricevono in <strong>unica soluzione annuale</strong> (a Dicembre per la 13ª e a Giugno/Luglio per la 14ª).
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Nelle Tariffe puoi scegliere l&apos;opzione che corrisponde al tuo contratto: se scegli l&apos;unica soluzione, l'importo non gonfierà il netto dei mesi ordinari ma verrà conteggiato esattamente nel mese di accredito!
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Giorni Festivi Nazionali Italiani
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Nel calendario, tutti i <strong>giorni festivi del calendario italiano</strong> (Capodanno, Epifania, Pasqua, Pasquetta, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, Ognissanti, 8 Dicembre, Natale, Santo Stefano) sono evidenziati con il <strong>numero rosso</strong> e la relativa etichetta. Se lavori in uno di questi giorni, viene applicata la maggiorazione per giorno festivo!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Header Sezione */}
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Stampa, Google Calendar, CSV & Backup JSON
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
                    <h4 className="font-bold text-xs sm:text-sm">Come importare i turni su Google Calendar</h4>
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Sincronizzazione orari su PC, Mac, Android e iPhone</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-200/80 dark:border-blue-900/50 space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                      💻 Procedura da Computer (Web):
                    </strong>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      <li>Tocca il pulsante <strong>Stampa</strong> nella barra superiore e seleziona <strong>&quot;Google Calendar (File .ics)&quot;</strong>.</li>
                      <li>Verrà scaricato un file <code>.ics</code> contenente tutti i tuoi turni del mese con orari precisi.</li>
                      <li>Apri <strong>Google Calendar</strong> nel browser (calendar.google.com).</li>
                      <li>Clicca sull&apos;icona ingranaggio ⚙️ in alto a destra &gt; seleziona <strong>&quot;Impostazioni&quot;</strong>.</li>
                      <li>Nel menu laterale sinistro, clicca su <strong>&quot;Importazione ed esportazione&quot;</strong>.</li>
                      <li>Clicca su <em>&quot;Seleziona il file dal computer&quot;</em>, scegli il file <code>.ics</code> appena scaricato e premi <strong>&quot;Importa&quot;</strong>.</li>
                      <li>I turni appariranno subito sul tuo calendario con l&apos;orario di entrata, uscita e pause!</li>
                    </ol>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-200/80 dark:border-blue-900/50 space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                      📱 Procedura da Smartphone (Android &amp; iPhone):
                    </strong>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      <li>Tocca il pulsante <strong>Stampa</strong> in alto e premi <strong>&quot;Google Calendar (File .ics)&quot;</strong>.</li>
                      <li>Appena terminato il download, tocca la notifica di download o apri il file dall&apos;app <strong>File / Download</strong> del telefono.</li>
                      <li>Il sistema operativo ti chiederà automaticamente con quale applicazione aprirlo (Google Calendar o Calendario Apple).</li>
                      <li>Seleziona <strong>&quot;Aggiungi tutti gli eventi&quot;</strong> per salvarli nel tuo calendario con promemoria e notifiche integrate.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Box 2: Come Salvare e Ripristinare il Backup JSON */}
              <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <FileCode2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">Come eseguire e ripristinare il Backup JSON</h4>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">Backup sicuro di turni, tariffe, spese e preset</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-200/80 dark:border-purple-900/50 space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                      💾 Come Scaricare la Copia di Backup (Download):
                    </strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      Clicca sull&apos;icona <strong>Stampa</strong> nella barra in alto e seleziona <strong>&quot;Backup Completo (JSON)&quot;</strong>.
                      Verrà generato e salvato un file <code>.json</code> contenente tutti i tuoi turni registrati di ogni mese, le tue spese, le tariffe personalizzate e i preset di orario.
                    </p>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-200/80 dark:border-purple-900/50 space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                      🔄 Come Ripristinare i Dati (Restore):
                    </strong>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      <li>Apri la finestra <strong>Stampa</strong> (icona stampante in alto).</li>
                      <li>Tocca la voce <strong>&quot;Ripristina Backup da file JSON&quot;</strong>.</li>
                      <li>Seleziona il file <code>.json</code> precedentemente salvato dal tuo smartphone o computer.</li>
                      <li>L&apos;app ricaricherà immediatamente tutti i turni, le spese e le impostazioni del contratto senza alcuna perdita di dati.</li>
                    </ol>
                    <p className="text-[10px] text-purple-800 dark:text-purple-300 pt-0.5 italic">
                      💡 Consiglio: esegui un backup JSON prima di pulire i dati del browser o quando cambi telefono per trasferire tutto in un secondo!
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
                    Genera un documento A4 pulito con riepilogo ore lavorate, totali notturni/festivi, straordinari e stima netto, pronto per essere stampato o salvato come file PDF.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>File CSV per Excel</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Esporta tutti i dati in formato tabellare compatibile con Microsoft Excel, Google Fogli, LibreOffice Calc o Apple Numbers per analisi approfondite.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1">
                <h3 className="font-bold text-sm text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Sincronizzazione Cloud Multi-Dispositivo
                </h3>
                <p>
                  Non rischiare di perdere i tuoi dati e consulta i turni su qualunque dispositivo (smartphone, tablet o PC).
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
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Ho capito, chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
