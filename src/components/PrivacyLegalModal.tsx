import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  Lock,
  AlertTriangle,
  FileText,
  Server,
  Scale,
  UserCheck,
  Cookie,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface PrivacyLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'disclaimer' | 'gdpr' | 'sync' | 'cookies' | 'terms';

export const PrivacyLegalModal: React.FC<PrivacyLegalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('disclaimer');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Informativa Legale, Privacy & Trasparenza
              </h2>
              <p className="text-xs text-slate-400">
                Conforme al GDPR (Reg. UE 2016/679) & Normative sulla Protezione dei Dati
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 pt-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-amber-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            1. Disclaimer Legale
          </button>

          <button
            onClick={() => setActiveTab('gdpr')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gdpr'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            2. Privacy Policy (GDPR)
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-purple-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            3. Cloud Sync & Sicurezza
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cookies'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            4. Cookie & Storage
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            5. Licenza & Diritti
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 overflow-y-auto flex-1 bg-white dark:bg-slate-900 transition-colors leading-relaxed">

          {/* TAB 1: DISCLAIMER LEGALE */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-amber-950 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  AVVISO LEGALE SUL VALORE DEI CALCOLI RETRIBUTIVI
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  L&apos;applicazione <strong>Salary Tracker SK</strong> è uno strumento software di supporto ad uso personale finalizzato al monitoraggio autonomo del calendario dei turni e alla stima orientativa dei compensi di lavoro.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Punti Chiave di Limitazione della Responsabilità:
                </h3>

                <ul className="space-y-2.5 list-disc pl-5 text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>Assenza di Valore Ufficiale o Probatorio:</strong> I prospetti, i riepiloghi mensili e le stime economiche generate dall&apos;applicazione <strong>NON costituiscono</strong> busta paga o cedolino paga aziendale ai sensi della Legge 5 gennaio 1953, n. 4, né hanno alcun valore legale, fiscale, previdenziale o giuslavoristico nei confronti del datore di lavoro o degli enti previdenziali (INPS, INAIL, ecc.).
                  </li>
                  <li>
                    <strong>Dipendenza dai Dati Inseriti:</strong> L&apos;accuratezza delle stime calcolate dipende esclusivamente dalla precisione, completezza e veridicità dei dati di input forniti autonomamente dall&apos;utente (tariffa oraria base, maggiorazioni per turni diurni/notturni, ore straordinarie, lavoro festivo, riposi compensativi, trattenute e contributi).
                  </li>
                  <li>
                    <strong>Invariabilità dei Contratti Collettivi (CCNL):</strong> Le formule di calcolo sono basate sui coefficienti e sui parametri standard impostati nelle configurazioni. L&apos;app non integra automaticamente tutte le specificità, le clausole locali o le varianti individuali di tutti i Contratti Collettivi Nazionali del Lavoro (CCNL) o accordi integrativi aziendali.
                  </li>
                  <li>
                    <strong>Esenzione da Responsabilità Legale o Contabile:</strong> Lo sviluppatore, il distributore e i fornitori dell&apos;infrastruttura declinano espressamente qualsiasi responsabilità diretta, indiretta, incidentale o consequenziale per eventuali discrepanze tra gli importi stimati e gli importi effettivamente erogati dal datore di lavoro, nonché per eventuali decisioni finanziarie, vertenze di lavoro o contenziosi basati sui dati generati dall&apos;app.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: GDPR PRIVACY POLICY */}
          {activeTab === 'gdpr' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl text-blue-950 dark:text-blue-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900 dark:text-blue-100">
                  <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI
                </div>
                <p className="text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed">
                  Ai sensi degli Articoli 13 e 14 del Regolamento Generale sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    1. Titolare del Trattamento & Controllo dei Dati
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;applicazione opera secondo un paradigma <strong>Privacy-by-Design</strong> e <strong>Privacy-by-Default</strong>. L&apos;utente è il Titolare ed unico gestore esclusivo dei propri dati personali inseriti nell&apos;applicazione.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-purple-500" />
                    2. Categorie di Dati Trattati
                  </strong>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li><strong>Dati di Configurazione Contrattuale:</strong> Parametri di tariffa oraria, stipendio lordo/netto teorico, monte ore settimanale, percentuali di maggiorazione e indennità.</li>
                    <li><strong>Dati di Turnistica e Presenza:</strong> Date dei turni, orari di inizio/fine, pause non retribuite, tipologie di assenza (ferie, permessi, malattia, riposi) ed eventuali note personali.</li>
                    <li><strong>Dati di Autenticazione Sync (opzionali):</strong> Identificativo Utente e Passcode scelti dall&apos;utente per l&apos;accesso al proprio Cloudflare Worker privato.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    3. Finalità e Base Giuridica del Trattamento
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    La base giuridica (Art. 6 par. 1 lett. b, f GDPR) è costituita dall&apos;esecuzione del servizio richiesto dall&apos;utente e dal legittimo interesse dell&apos;utente ad usufruire di un gestionale personale per il calendario di lavoro. I dati <strong>non vengono mai utilizzati per finalità commerciali, profilazione o marketing</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-rose-500" />
                    4. Diritti dell&apos;Interessato (Art. 15-22 GDPR)
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;utente possiede il controllo totale dei propri dati in qualsiasi momento:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li><strong>Diritto di Accesso e Portabilità:</strong> Può scaricare o consultare immediatamente tutti i propri turni e la configurazione.</li>
                    <li><strong>Diritto alla Cancellazione (Diritto all&apos;Oblio):</strong> Cliccando sul pulsante &quot;Disconnetti&quot; nella sezione Cloud o cancellando i dati del browser, l&apos;applicazione elimina istantaneamente tutti i dati locali del calendario e delle impostazioni da quel dispositivo.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUD SYNC & SICUREZZA */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-2xl text-purple-950 dark:text-purple-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-900 dark:text-purple-100">
                  <Server className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                  ARCHITETTURA DI SINCRONIZZAZIONE MULTI-DEVICE
                </div>
                <p className="text-xs text-purple-900/90 dark:text-purple-200/90 leading-relaxed">
                  Informativa dettagliata sul funzionamento del servizio opzionale Cloudflare Worker Sync.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-500" />
                    Protocollo e Canale di Trasmissione Sicuro
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Quando l&apos;utente attiva la sincronizzazione cloud inserendo il proprio URL Worker, Nome Utente e Password:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Tutti i trasferimenti tra il dispositivo dell&apos;utente e l&apos;infrastruttura server avvengono mediante canale crittografato <strong>HTTPS / TLS 1.3</strong>.</li>
                    <li>L&apos;autenticazione è protetta da header di sicurezza HTTP personalizzati (<code>X-User-Key</code>, <code>X-Passcode</code>) per verificare l&apos;identità ed evitare accessi non autorizzati.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-500" />
                    Isolamento dei Dati nel Cloud Storage (KV Storage)
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    I dati del calendario e della configurazione vengono salvati nel database <strong>Cloudflare Key-Value (KV) Storage</strong> associato univocamente alla combinazione del vostro Nome Utente. Nessun altro utente o terza parte può accedere al vostro spazio di archiviazione protetto.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Reset & Purga Automatica dei Dati
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Qualora decidiate di disconnettervi tramite l&apos;apposito pulsante &quot;Disconnetti&quot;, le credenziali di sincronizzazione vengono eliminate dal browser locale e l&apos;applicazione provvede al reset dei dati sul dispositivo per garantire la massima riservatezza.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COOKIE & STORAGE LOCALE */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-emerald-950 dark:text-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-100">
                  <Cookie className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  POLITICA SUI COOKIE E TECNOLOGIE DI ARCHIVIAZIONE
                </div>
                <p className="text-xs text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
                  Nessun cookie di tracciamento. Esclusivo utilizzo dell&apos;HTML5 Web Storage locale.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Zero Cookie di Profilazione o Terze Parti
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;applicazione <strong>non installa</strong> né utilizza cookie pubblicitari, cookie analitici (come Google Analytics, Adobe, Hotjar, Facebook Pixel) o tracker di terze parti. Non viene effettuato alcun tracciamento delle abitudini di navigazione dell&apos;utente.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-500" />
                    Utilizzo di HTML5 LocalStorage (Archiviazione Tecnica Essenziale)
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;applicazione fa uso esclusivamente della memoria interna del browser (<code>window.localStorage</code>) per salvare lo stato necessario al corretto funzionamento dell&apos;app:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    <li><code>work_contract_config</code>: Salva le impostazioni contrattuali e tariffe.</li>
                    <li><code>work_shifts</code>: Memorizza il registro dei turni inseriti.</li>
                    <li><code>quick_templates</code>: Conserva i modelli rapidi di turno personalizzati.</li>
                    <li><code>sync_credentials</code>: Mantiene le credenziali per la sincronizzazione cloud (se attivata).</li>
                  </ul>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    Trattandosi di archiviazione tecnica indispensabile per l&apos;erogazione del servizio su richiesta dell&apos;utente, ai sensi della Direttiva ePrivacy e del Provvedimento Garante Privacy n. 231/2021, <strong>non è richiesto un banner di consenso preventivo per i cookie</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LICENZA & DIRITTI */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0" />
                  TERMINI DI LICENZA E PROPRIETÀ INTELLETTUALE
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Condizioni generali di licenza d&apos;uso dell&apos;applicazione.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white">
                    Uso Personale e Self-Hosting
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;utente ha il diritto di utilizzare liberamente l&apos;applicazione per il proprio uso individuale o di ospitarla (self-hosting) su infrastrutture private (GitHub Pages, Vercel, Netlify, Cloudflare Pages o server privati).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white">
                    Aggiornamenti delle Condizioni
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Le presenti note legali e la privacy policy possono essere aggiornate periodicamente per riflettere modifiche legislative o aggiornamenti delle funzionalità tecniche dell&apos;applicazione. L&apos;utilizzo continuato dell&apos;applicazione costituisce accettazione delle condizioni vigenti.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal Action */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Versione Informativa: 2.1 • Ultimo aggiornamento: Agosto 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Chiudi e Ho Capito
          </button>
        </div>

      </div>
    </div>
  );
};
