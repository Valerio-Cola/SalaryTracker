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
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'turni' | 'tariffe' | 'bonus' | 'ferie' | 'cloud';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('turni');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors flex flex-col max-h-[85vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Guida & Aiuto Salary Tracker</h2>
              <p className="text-xs text-blue-100">
                Tutto quello che c'è da sapere per calcolare stipendio, turni e ferie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-2 rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Cloud & Backup
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
                    Se il tuo turno supera le ore <strong>22:00</strong> o finisce dopo la mezzanotte (fino alle <strong>06:00</strong>), l'app calcola automaticamente i minuti notturni esatti e vi applica la maggiorazione notturna prevista dal tuo contratto.
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

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  ⭐ <span>Template Rapidi</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Fai spesso lo stesso orario (es. Chiusura 18:30-01:30 o Pranzo 11:30-15:30)? Nella finestra del turno puoi cliccare direttamente sui pulsanti dei template per compilare tutto in un secondo.
                </p>
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
                  <div className="font-bold text-slate-900 dark:text-white">
                    Tredicesima e Quattordicesima: Come le ricevi?
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Molti lavoratori prendono la 13ª e la 14ª a <strong>rate mensili</strong> (1/12 ogni mese in busta paga), mentre altri le ricevono in <strong>unica soluzione annuale</strong> (a Dicembre per la 13ª e a Giugno/Luglio per la 14ª).
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Nelle Tariffe puoi scegliere l'opzione che corrisponde al tuo contratto: se scegli l'unica soluzione, l'importo non gonfierà il netto dei mesi ordinari ma verrà conteggiato esattamente nel mese di accredito!
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
                    1. Clicca sull'icona della <strong>Nuvola (Cloud)</strong> in alto a destra.<br />
                    2. Inserisci il tuo <strong>Nome Utente</strong> e la tua <strong>Password</strong> personale.<br />
                    3. Supera la rapida verifica di sicurezza e clicca su <strong>"Accedi e Sincronizza"</strong>.<br />
                    4. Da quel momento, ad ogni modifica (nuovo turno, spesa o cambio tariffe), l'app salverà i tuoi dati in tempo reale sul cloud protetto!
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
