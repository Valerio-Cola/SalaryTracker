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
  ShieldAlert,
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
    <div className="fixed inset-0 z-[70] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
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
                    <strong>Assenza di Valore Ufficiale o Probatorio:</strong> I prospetti, i riepiloghi mensili e le stime economiche generate dall&apos;applicazione <strong>NON costituiscono</strong> busta paga o cedolino paga aziendale ai sensi della Legge 5 gennaio 1953, n. 4, né hanno alcun valore legale, fiscale, previdenziale o giuslavoristico nei confronti del datore di lavoro o degli enti previdenziali (INPS, INAIL, Agenzia delle Entrate).
                  </li>
                  <li>
                    <strong>Integrazioni Fiscali e Bonus (L. 207/2024 e Trattamento Integrativo):</strong> Le stime relative al <em>Bonus L. 207/2024 (Art. 1, C. 4 - Legge di Bilancio 2025)</em> e al <em>Bonus Renzi (D.L. 3/2020)</em> sono calcolate sulla base dei parametri inseriti o dello scaglione di reddito stimato (fino a 8.500€, da 8.501€ a 15.000€, da 15.001€ a 20.000€). L&apos;effettiva spettanza e l&apos;eventuale conguaglio a fine anno dipendono dal reddito complessivo annuo effettivo certificato nella Certificazione Unica (CU).
                  </li>
                  <li>
                    <strong>Ratei 13ª, 14ª e Maturazione Ferie:</strong> I calcoli di rateizzazione o corresponsione annuale di tredicesima e quattordicesima, nonché il contatore dei giorni di ferie maturati e residui, costituiscono stime puramente indicative ad ausilio del lavoratore e non sostituiscono i conteggi dell&apos;ufficio risorse umane o del consulente del lavoro.
                  </li>
                  <li>
                    <strong>Applicabilità CCNL e Contrattazione Collettiva:</strong> I parametri dell&apos;applicazione sono interamente flessibili e personalizzabili per adattarsi a qualsiasi Contratto Collettivo Nazionale di Lavoro (es. Pubblici Esercizi, Ristorazione Collettiva / Fast Food, Commercio e Terziario, Logistica, Multiservizi, Metalmeccanico). Tuttavia, i minimi tabellari orari, gli scatti di anzianità, le indennità di turno e le maggiorazioni per lavoro supplementare, straordinario, notturno e festivo devono essere verificati dal lavoratore sul proprio CCNL applicato.
                  </li>
                  <li>
                    <strong>Voci e Bonus Personalizzabili & Spese:</strong> Le voci accessorie create dall&apos;utente (sia fisse mensili che a cadenza periodica ogni TOT mesi, lorde o esenti) e il registro spese/rimborsi sono gestiti a cura esclusiva dell&apos;utente a scopo di monitoraggio personale e non hanno efficacia vincolante nei confronti del datore di lavoro.
                  </li>
                  <li>
                    <strong>Stima del Netto e Conguagli Fiscali IRPEF:</strong> La quantificazione del compenso netto si basa sull&apos;aliquota media stimata configurata dall&apos;utente e non comprende le addizionali regionali e comunali, le detrazioni per carichi di famiglia o eventuali altri redditi percepiti. Il conguaglio fiscale definitivo viene effettuato annualmente dal datore di lavoro in sede di modello 730/Redditi.
                  </li>
                  <li>
                    <strong>Dipendenza dai Dati Inseriti:</strong> L&apos;accuratezza delle stime calcolate dipende esclusivamente dalla precisione, completezza e veridicità dei dati di input forniti autonomamente dall&apos;utente (tariffa oraria base, maggiorazioni per turni diurni/notturni, ore straordinarie, lavoro festivo, riposi compensativi, trattenute e contributi).
                  </li>
                  <li>
                    <strong>Sincronizzazione Cloud Multi-Device ad Accesso Riservato:</strong> La funzionalità facoltativa di sincronizzazione cloud su Cloudflare Worker/KV Storage è un servizio ad accesso limitato e riservato esclusivamente agli utenti espressamente autorizzati dall&apos;amministratore, senza registrazione pubblica. Non costituisce un servizio SaaS o cloud storage aperto al pubblico. L&apos;eventuale tipping o supporto volontario tramite piattaforme esterne (es. Ko-fi) costituisce una libera elargizione a fondo perduto e non comporta alcun acquisto di servizi commerciali, non dà diritto automatico all&apos;attivazione di un account, né tantomeno l&apos;assenza o la presenza di donazioni preclude la possibilità di ottenere un account autorizzato.
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
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    1. Definizione del Ruolo GDPR (Titolare vs Gestore dell&apos;Infrastruttura)
                  </strong>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    L&apos;applicazione opera secondo un paradigma <strong>Privacy-by-Design</strong> e <strong>Privacy-by-Default</strong>. L&apos;utente è il Titolare ed unico gestore esclusivo dei propri dati personali inseriti nell&apos;applicazione.
                  </p>
                  
                  <div className="space-y-2 pt-1 text-[11.5px] text-slate-600 dark:text-slate-400">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1">
                      <strong className="text-slate-800 dark:text-slate-200 block font-semibold">
                        💻 In locale (LocalStorage):
                      </strong>
                      <p className="leading-relaxed">
                        I dati risiedono unicamente nel browser dell&apos;utente, che li gestisce in prima persona per fini esclusivamente personali o domestici (ipotesi di esclusione ex Art. 2, par. 2, lett. c del GDPR).
                      </p>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1">
                      <strong className="text-slate-800 dark:text-slate-200 block font-semibold">
                        ☁️ Con Sincronizzazione Cloud (Cloudflare Worker / KV):
                      </strong>
                      <p className="leading-relaxed">
                        Quando i dati (anche se associati a uno pseudonimo o a una chiave utente) risiedono sul database KV, la gestione tecnica dei dati transita sui server cloud.
                      </p>
                      <p className="leading-relaxed pt-1 font-medium text-slate-700 dark:text-slate-300">
                        <strong>Contatto Gestore Infrastruttura / Amministratore:</strong> Valerio Cola — Email per adempimenti privacy e gestione infrastruttura: <a href="mailto:valeriocola2003@gmail.com" className="text-blue-600 dark:text-blue-400 underline font-semibold">valeriocola2003@gmail.com</a>.
                      </p>
                      <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
                        Si precisa che per il servizio cloud opzionale i dati transitano su canale cifrato HTTPS/TLS e risiedono protetti su istanze dedicate Cloudflare per la sola ed esclusiva finalità di backup e sincronizzazione multi-dispositivo dell&apos;utente autorizzato.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-purple-500" />
                    2. Categorie di Dati Trattati
                  </strong>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li><strong>Dati Contrattuali e Retributivi:</strong> Parametri di tariffa oraria, stipendio lordo/netto teorico, monte ore settimanale, percentuali di maggiorazione oraria, ratei 13ª/14ª, bonus Legge 207/2024 e voci personalizzate.</li>
                    <li><strong>Dati di Turnistica e Presenza:</strong> Date dei turni, orari di entrata/uscita, pause non retribuite, giornate di ferie/permessi retribuiti e note personali di lavoro.</li>
                    <li><strong>Gestione Spese e Rimborsi:</strong> Titoli delle spese, importi in euro, categorie e date (memorizzati unicamente per il bilancio personale dell&apos;utente).</li>
                    <li><strong>Dati di Autenticazione Sync (opzionali):</strong> Identificativo Utente e Passcode scelti dall&apos;utente per l&apos;accesso al proprio Cloudflare Worker privato.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    3. Finalità e Base Giuridica del Trattamento
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    La base giuridica (Art. 6 par. 1 lett. b, f GDPR) è costituita dall&apos;esecuzione del servizio richiesto dall&apos;utente e dal legittimo interesse dell&apos;utente ad usufruire di un gestionale personale per il calendario di lavoro. I dati <strong>non vengono mai venduti, profilati o usati per finalità pubblicitarie</strong>.
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
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                    <li><strong>Diritto di Accesso, Esportazione e Portabilità:</strong> Può scaricare o consultare immediatamente tutti i propri turni in formato CSV per Excel o stampare il prospetto mensile.</li>
                    <li><strong>Diritto alla Cancellazione &amp; Oblio (Art. 17 GDPR):</strong>
                      <ul className="list-circle pl-5 mt-1 space-y-1 text-[11px]">
                        <li><strong>In Locale:</strong> Cliccando su &quot;Disconnetti&quot; o cancellando la cronologia del browser, l&apos;applicazione elimina istantaneamente tutti i dati memorizzati sul dispositivo.</li>
                        <li><strong>Nel Cloud:</strong> Tramite la funzione autonoma &quot;Elimina Account&quot; disponibile nel pannello Cloud, l&apos;utente può distruggere per sempre e in tempo reale tutti i propri dati (turni, tariffe, spese) e le credenziali di autenticazione archiviati nel database Cloudflare KV, senza bisogno di inviare richieste manuali.</li>
                      </ul>
                    </li>
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
                  Informativa dettagliata sul funzionamento del servizio Cloudflare Worker &amp; KV Storage Sync.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1.5 text-amber-900 dark:text-amber-200">
                  <strong className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Accesso Riservato ed Esclusione di Servizio Pubblico (No SaaS)
                  </strong>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    Il servizio di sincronizzazione cloud è ad <strong>accesso limitato e riservato esclusivamente agli utenti espressamente autorizzati dall&apos;amministratore, senza registrazione pubblica</strong>. L&apos;applicazione non è un servizio SaaS commerciale aperto al pubblico né offre iscrizioni libere o creazione autonoma di account sul web; la risorsa cloud è un ambiente privato e controllato, istanziato unicamente per le utenze pre-autorizzate.
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[10.5px] pt-1 border-t border-amber-200/60 dark:border-amber-800/50">
                    <strong>Natura del Supporto Volontario:</strong> Qualsiasi donazione o tipping facoltativo effettuato tramite Ko-fi costituisce una mera liberalità a supporto dei costi vivi e dello sviluppo. Il tipping non vincola, non garantisce e non conferisce alcun diritto all&apos;attivazione di un account, così come non aver effettuato donazioni non preclude la possibilità di ricevere un account autorizzato.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-500" />
                    Protocollo e Canale di Trasmissione Sicuro
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Quando l&apos;utente autorizzato attiva la sincronizzazione cloud:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Tutti i trasferimenti tra il dispositivo dell&apos;utente e l&apos;infrastruttura server avvengono mediante canale crittografato <strong>HTTPS / TLS 1.3</strong>.</li>
                    <li>L&apos;autenticazione è protetta da header di sicurezza HTTP dedicati (<code>X-User-Key</code>, <code>X-Passcode</code>) per verificare l&apos;identità ed evitare accessi non autorizzati.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Verifica Anti-Bot Cloudflare Turnstile
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;accesso e la sincronizzazione cloud sono protetti da <strong>Cloudflare Turnstile</strong>, un meccanismo di verifica anti-bot a tutela della privacy che non fa uso di cookie di profilazione o tracciamento biometrico e previene tentativi di accesso automatizzato non autorizzato o brute-force.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-purple-500" />
                    Isolamento dei Dati nel Cloud Storage (KV Storage)
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    I dati del calendario, delle spese e delle tariffe vengono memorizzati nello spazio <strong>Cloudflare Key-Value (KV) Storage</strong> del Worker associato univocamente al proprio Username. Nessun altro utente o terza parte può accedere al vostro archivio turni dedicato.
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
                  Nessun cookie di tracciamento pubblicitario. Esclusivo utilizzo dell&apos;HTML5 Web Storage locale tecnico.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Zero Cookie di Profilazione o Terze Parti
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;applicazione <strong>non installa</strong> cookie pubblicitari o pixel di monitoraggio commerciale (come Meta Pixel, Google Ads, TikTok Pixel). I dati risiedono unicamente nel vostro dispositivo.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-500" />
                    Chiavi Tecniche HTML5 LocalStorage Utilizzate
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;applicazione fa uso esclusivamente della memoria interna del browser (<code>window.localStorage</code>) per il salvataggio tecnico essenziale:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    <li><code>bk_config_v2</code>: Configurazione contrattuale, tariffe, maggiorazioni e bonus.</li>
                    <li><code>bk_storico_v2</code>: Registro completo dei turni lavorativi e ferie.</li>
                    <li><code>bk_expenses_v2</code>: Registro spese personali e rimborsi del mese.</li>
                    <li><code>bk_templates_v2</code>: Modelli rapidi preimpostati per inserimento turni veloci.</li>
                    <li><code>bk_sync_creds</code>: Credenziali di sincronizzazione per il cloud (se attivate).</li>
                    <li><code>app_theme</code>: Preferenza visiva modalità Notte / Giorno.</li>
                  </ul>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    Trattandosi di memorizzazione tecnica indispensabile per l&apos;erogazione del servizio su espressa richiesta dell&apos;utente (Direttiva ePrivacy 2002/58/CE e Provvedimento Garante Privacy n. 231/2021), <strong>non è necessario alcun banner cookie invasivo</strong>.
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
                    Uso Personale e Sviluppo
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    L&apos;utente ha il diritto di utilizzare liberamente l&apos;applicazione per il proprio uso individuale. L&apos;applicazione è ideata e sviluppata da Valerio Cola come ausilio digitale per lavoratori dipendenti.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <strong className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>☕ Supporto al Progetto &amp; Liberalità delle Donazioni</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">100% Gratuito & Libero</span>
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Il servizio è gratuito e indipendente, sviluppato per semplificare la vita lavorativa di chi fa turni. Se trovi utile l&apos;applicazione, puoi supportare lo sviluppo continuo, l&apos;aggiornamento alle nuove leggi fiscali e i costi dell&apos;infrastruttura offrendo un caffè:
                  </p>
                  <div className="pt-0.5">
                    <a
                      href="https://ko-fi.com/I1A228L9XZ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      title="Supporta lo sviluppo su Ko-fi"
                    >
                      <img
                        width="143"
                        height="36"
                        loading="lazy"
                        decoding="async"
                        style={{ border: '0px', width: '143px', height: '36px', aspectRatio: '143 / 36' }}
                        src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
                        alt="Buy Me a Coffee at ko-fi.com"
                      />
                    </a>
                  </div>
                  <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/50 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <strong className="text-blue-900 dark:text-blue-200 block font-semibold">
                      Chiarimento su Tipping e Account di Sincronizzazione:
                    </strong>
                    <p className="leading-relaxed">
                      Il tipping (mance/donazioni) tramite Ko-fi rappresenta un mero gesto di apprezzamento personale e non costituisce corrispettivo per l&apos;acquisto di beni o servizi. <strong>Il tipping non dà diritto automatico né garantisce l&apos;apertura di un account cloud riservato, così come non aver donato non preclude in alcun modo la possibilità di ottenere un account autorizzato</strong> rilasciato a discrezione dell&apos;amministratore.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <strong className="font-bold text-slate-900 dark:text-white">
                    Aggiornamenti delle Condizioni
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Le presenti note legali e la privacy policy possono essere aggiornate periodicamente per riflettere novità fiscali (come le Leggi di Bilancio annuali) o aggiornamenti delle funzionalità tecniche dell&apos;applicazione.
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
            <span>Versione Informativa: 2.2 • Ultimo aggiornamento: Ottobre 2026</span>
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
