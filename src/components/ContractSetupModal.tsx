import React, { useState, useEffect } from 'react';
import { ContractConfig, CustomAllowance, CustomHourlySurcharge, QuickTemplate } from '../types';
import { DEFAULT_TEMPLATES } from '../utils/storage';
import {
  X,
  Save,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Coins,
  Palmtree,
  Sparkles,
  Plus,
  Trash2,
  Info,
  Clock,
  Moon,
  ChevronRight,
  Sun,
  AlertCircle,
  Pencil,
  Zap,
} from 'lucide-react';

const NOMI_MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

function getComputedMonthsList(intervallo: number, inizio: number): string {
  const intVal = Math.max(1, intervallo);
  const startVal = Math.max(1, Math.min(12, inizio));
  const activeMonths: string[] = [];
  for (let m = 1; m <= 12; m++) {
    const diff = (m - startVal) % intVal;
    if ((diff + intVal) % intVal === 0) {
      activeMonths.push(NOMI_MESI[m - 1]);
    }
  }
  return activeMonths.join(', ');
}

function computePresetDuration(
  inizio: string,
  fine: string,
  pausaMin: number,
  oraInizioNotte: string = '22:00',
  oraFineNotte: string = '06:00'
): { oreTotali: number; oreNotturne: number } {
  if (!inizio || !fine) return { oreTotali: 0, oreNotturne: 0 };
  const [h1, m1] = inizio.split(':').map(Number);
  const [h2, m2] = fine.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return { oreTotali: 0, oreNotturne: 0 };

  let startMinutes = h1 * 60 + m1;
  let endMinutes = h2 * 60 + m2;
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // turno che sfora dopo mezzanotte
  }
  const diffMinutes = Math.max(0, endMinutes - startMinutes - (pausaMin || 0));
  const oreTotali = Number((diffMinutes / 60).toFixed(2));

  const [nSh, nSm] = (oraInizioNotte || '22:00').split(':').map(Number);
  const [nEh, nEm] = (oraFineNotte || '06:00').split(':').map(Number);
  const nStart = (nSh || 0) * 60 + (nSm || 0);
  const nEnd = (nEh || 0) * 60 + (nEm || 0);

  let nightMinutes = 0;
  for (let min = startMinutes; min < endMinutes; min++) {
    const modMin = min % (24 * 60);
    if (nStart >= nEnd) {
      if (modMin >= nStart || modMin < nEnd) {
        nightMinutes++;
      }
    } else {
      if (modMin >= nStart && modMin < nEnd) {
        nightMinutes++;
      }
    }
  }
  const oreNotturne = Number((Math.min(nightMinutes, diffMinutes) / 60).toFixed(2));
  return { oreTotali, oreNotturne };
}

interface ContractSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ContractConfig;
  onSave: (newConfig: ContractConfig, newTemplates?: QuickTemplate[]) => void;
  onResetShiftsOnly: () => void;
  templates: QuickTemplate[];
  onSaveTemplates: (newTemplates: QuickTemplate[]) => void;
}

export const ContractSetupModal: React.FC<ContractSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onResetShiftsOnly,
  templates,
  onSaveTemplates,
}) => {
  const [formData, setFormData] = useState<ContractConfig>({
    ...config,
    vociPersonalizzate: config.vociPersonalizzate || [],
  });
  const [localTemplates, setLocalTemplates] = useState<QuickTemplate[]>(templates || []);
  const [successMsg, setSuccessMsg] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('sec-generale');

  // Stato per nuova voce personalizzata cedolino
  const [newVoceNome, setNewVoceNome] = useState('');
  const [newVoceImporto, setNewVoceImporto] = useState('');
  const [newVoceTipo, setNewVoceTipo] = useState<'mensile' | 'ogni_tot_mesi'>('mensile');
  const [newVoceIntervallo, setNewVoceIntervallo] = useState('3');
  const [newVoceMeseInizio, setNewVoceMeseInizio] = useState('3');
  const [newVoceTassabile, setNewVoceTassabile] = useState(false);

  // Stato per nuove maggiorazioni orarie personalizzate (€/h) e modifica esistente
  const [editingMaggiorazioneId, setEditingMaggiorazioneId] = useState<string | null>(null);
  const [newMaggiorazioneNome, setNewMaggiorazioneNome] = useState('');
  const [newMaggiorazioneTariffa, setNewMaggiorazioneTariffa] = useState('');
  const [newMaggiorazioneApplicaDefault, setNewMaggiorazioneApplicaDefault] = useState(false);
  const [newMaggiorazioneDesc, setNewMaggiorazioneDesc] = useState('');

  // Stato per nuovo preset di orari e modifica preset esistente
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [newPresetTitolo, setNewPresetTitolo] = useState('');
  const [newPresetInizio, setNewPresetInizio] = useState('');
  const [newPresetFine, setNewPresetFine] = useState('');
  const [newPresetPausa, setNewPresetPausa] = useState('0');
  const [newPresetNote, setNewPresetNote] = useState('');
  const [presetFeedback, setPresetFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...config,
        vociPersonalizzate: config.vociPersonalizzate || [],
        maggiorazioniOrariePersonalizzate: config.maggiorazioniOrariePersonalizzate || [],
      });
      setLocalTemplates(templates || []);
      setPresetFeedback(null);
      setEditingPresetId(null);
      setEditingMaggiorazioneId(null);
      setNewPresetTitolo('');
      setNewPresetInizio('');
      setNewPresetFine('');
      setNewPresetPausa('0');
      setNewPresetNote('');
      setNewMaggiorazioneNome('');
      setNewMaggiorazioneTariffa('');
      setNewMaggiorazioneApplicaDefault(false);
      setNewMaggiorazioneDesc('');
    }
  }, [isOpen, config, templates]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ContractConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Voci personalizzate
  const handleAddCustomVoce = () => {
    if (!newVoceNome.trim()) return;
    const importoNum = parseFloat(newVoceImporto) || 0;
    if (importoNum <= 0) return;

    const intNum = Math.max(1, parseInt(newVoceIntervallo, 10) || 1);
    const startNum = Math.max(1, Math.min(12, parseInt(newVoceMeseInizio, 10) || 1));

    const nuovaVoce: CustomAllowance = {
      id: String(Date.now() + Math.random()),
      nome: newVoceNome.trim(),
      importo: importoNum,
      tipo: newVoceTipo,
      intervalloMesi: newVoceTipo === 'ogni_tot_mesi' ? intNum : undefined,
      meseInizio: newVoceTipo === 'ogni_tot_mesi' ? startNum : undefined,
      tassabile: newVoceTassabile,
    };

    setFormData((prev) => ({
      ...prev,
      vociPersonalizzate: [...(prev.vociPersonalizzate || []), nuovaVoce],
    }));

    setNewVoceNome('');
    setNewVoceImporto('');
  };

  const handleRemoveCustomVoce = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      vociPersonalizzate: (prev.vociPersonalizzate || []).filter((v) => v.id !== id),
    }));
  };

  // Gestione Maggiorazioni Orarie Personalizzate (€/h)
  const handleStartEditCustomMaggiorazione = (m: CustomHourlySurcharge) => {
    setEditingMaggiorazioneId(m.id);
    setNewMaggiorazioneNome(m.nome);
    setNewMaggiorazioneTariffa(String(m.importoOrario));
    setNewMaggiorazioneApplicaDefault(!!m.applicaDefault);
    setNewMaggiorazioneDesc(m.descrizione || '');
    const box = document.getElementById('maggiorazione-form-box');
    if (box) {
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCancelEditCustomMaggiorazione = () => {
    setEditingMaggiorazioneId(null);
    setNewMaggiorazioneNome('');
    setNewMaggiorazioneTariffa('');
    setNewMaggiorazioneApplicaDefault(false);
    setNewMaggiorazioneDesc('');
  };

  const handleAddCustomMaggiorazione = () => {
    if (!newMaggiorazioneNome.trim()) return;
    const tariffaNum = parseFloat(newMaggiorazioneTariffa) || 0;
    if (tariffaNum <= 0) return;

    if (editingMaggiorazioneId) {
      setFormData((prev) => ({
        ...prev,
        maggiorazioniOrariePersonalizzate: (prev.maggiorazioniOrariePersonalizzate || []).map((m) =>
          m.id === editingMaggiorazioneId
            ? {
                ...m,
                nome: newMaggiorazioneNome.trim(),
                importoOrario: tariffaNum,
                applicaDefault: newMaggiorazioneApplicaDefault,
                descrizione: newMaggiorazioneDesc.trim() || undefined,
              }
            : m
        ),
      }));
      handleCancelEditCustomMaggiorazione();
      return;
    }

    const nuovaMaggiorazione: CustomHourlySurcharge = {
      id: `magg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nome: newMaggiorazioneNome.trim(),
      importoOrario: tariffaNum,
      applicaDefault: newMaggiorazioneApplicaDefault,
      descrizione: newMaggiorazioneDesc.trim() || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      maggiorazioniOrariePersonalizzate: [
        ...(prev.maggiorazioniOrariePersonalizzate || []),
        nuovaMaggiorazione,
      ],
    }));

    handleCancelEditCustomMaggiorazione();
  };

  const handleRemoveCustomMaggiorazione = (id: string) => {
    if (editingMaggiorazioneId === id) {
      handleCancelEditCustomMaggiorazione();
    }
    setFormData((prev) => ({
      ...prev,
      maggiorazioniOrariePersonalizzate: (prev.maggiorazioniOrariePersonalizzate || []).filter((m) => m.id !== id),
    }));
  };

  // Gestione Preset Orari
  const handleStartEditPreset = (t: QuickTemplate) => {
    setEditingPresetId(t.id);
    setNewPresetTitolo(t.titolo);
    setNewPresetInizio(t.orarioInizio);
    setNewPresetFine(t.orarioFine);
    setNewPresetPausa(String(t.pausaMinuti || 0));
    setNewPresetNote(t.note || '');
    setPresetFeedback(null);
    const formBox = document.getElementById('preset-form-box');
    if (formBox) {
      formBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCancelEditPreset = () => {
    setEditingPresetId(null);
    setNewPresetTitolo('');
    setNewPresetInizio('');
    setNewPresetFine('');
    setNewPresetPausa('0');
    setNewPresetNote('');
    setPresetFeedback(null);
  };

  const handleAddPreset = () => {
    if (!newPresetTitolo.trim() || !newPresetInizio || !newPresetFine) {
      setPresetFeedback('Inserisci almeno titolo, orario di inizio e orario di fine.');
      return;
    }

    if (editingPresetId) {
      const updated = localTemplates.map((t) =>
        t.id === editingPresetId
          ? {
              ...t,
              titolo: newPresetTitolo.trim(),
              orarioInizio: newPresetInizio,
              orarioFine: newPresetFine,
              pausaMinuti: parseInt(newPresetPausa, 10) || 0,
              note: newPresetNote.trim() || undefined,
            }
          : t
      );
      setLocalTemplates(updated);
      onSaveTemplates(updated);

      setEditingPresetId(null);
      setNewPresetTitolo('');
      setNewPresetInizio('');
      setNewPresetFine('');
      setNewPresetPausa('0');
      setNewPresetNote('');
      setPresetFeedback('Preset modificato con successo!');
      setTimeout(() => setPresetFeedback(null), 3000);
      return;
    }

    const nuovoPreset: QuickTemplate = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      titolo: newPresetTitolo.trim(),
      orarioInizio: newPresetInizio,
      orarioFine: newPresetFine,
      pausaMinuti: parseInt(newPresetPausa, 10) || 0,
      note: newPresetNote.trim() || undefined,
    };

    const updated = [...localTemplates, nuovoPreset];
    setLocalTemplates(updated);
    onSaveTemplates(updated);

    // Reset modulo preset
    setNewPresetTitolo('');
    setNewPresetInizio('');
    setNewPresetFine('');
    setNewPresetPausa('0');
    setNewPresetNote('');
    setPresetFeedback('Preset aggiunto con successo!');
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  const handleRemovePreset = (presetId: string) => {
    if (editingPresetId === presetId) {
      handleCancelEditPreset();
    }
    const updated = localTemplates.filter((t) => t.id !== presetId);
    setLocalTemplates(updated);
    onSaveTemplates(updated);
    setPresetFeedback('Preset eliminato.');
    setTimeout(() => setPresetFeedback(null), 2000);
  };

  const handleResetDefaultPresets = () => {
    if (confirm('Vuoi ripristinare i preset predefiniti dell\'applicazione? I tuoi preset personalizzati saranno sostituiti dai 2 modelli standard di esempio.')) {
      setLocalTemplates(DEFAULT_TEMPLATES);
      onSaveTemplates(DEFAULT_TEMPLATES);
      setPresetFeedback('Preset predefiniti ripristinati.');
      setTimeout(() => setPresetFeedback(null), 3000);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    onSave(formData, localTemplates);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 800);
  };

  // Preview orario preset in compilazione
  const previewPresetDuration = computePresetDuration(
    newPresetInizio,
    newPresetFine,
    parseInt(newPresetPausa, 10) || 0,
    formData.oraInizioNotte,
    formData.oraFineNotte
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors flex flex-col max-h-[90vh]">
        
        {/* Header Modal - Sticky */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Sliders className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold">Tariffe, Contratto & Preset Orari</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Paga oraria base, maggiorazioni, bonus fiscali e modelli orari
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indice Navigazione Cliccabile - Sticky */}
        <div className="shrink-0 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider pr-1 shrink-0">
            Indice:
          </span>
          <button
            type="button"
            onClick={() => scrollToSection('sec-generale')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSection === 'sec-generale'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60'
            }`}
          >
            <Sliders className={`w-3.5 h-3.5 ${activeSection === 'sec-generale' ? 'text-white' : 'text-blue-500'}`} /> Paga Base
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('sec-maggiorazioni')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSection === 'sec-maggiorazioni'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/60'
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${activeSection === 'sec-maggiorazioni' ? 'text-white' : 'text-purple-500'}`} /> Maggiorazioni
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('sec-ratei')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSection === 'sec-ratei'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60'
            }`}
          >
            <Coins className={`w-3.5 h-3.5 ${activeSection === 'sec-ratei' ? 'text-white' : 'text-emerald-500'}`} /> 13ª, 14ª & Bonus
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('sec-ferie')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSection === 'sec-ferie'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60'
            }`}
          >
            <Palmtree className={`w-3.5 h-3.5 ${activeSection === 'sec-ferie' ? 'text-white' : 'text-amber-500'}`} /> Ferie
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('sec-voci')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSection === 'sec-voci'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200/60 dark:border-sky-800/60'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeSection === 'sec-voci' ? 'text-white' : 'text-sky-500'}`} /> Voci Extra
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('sec-preset')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSection === 'sec-preset'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${activeSection === 'sec-preset' ? 'text-white' : 'text-indigo-500'}`} /> Preset Orari
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('sec-reset')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSection === 'sec-reset'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-800/60'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${activeSection === 'sec-reset' ? 'text-white' : 'text-rose-500'}`} /> Reset
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form
          id="contract-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors"
        >
          {/* 1. SEZIONE GENERALE & PAGA BASE */}
          <div id="sec-generale" className="space-y-3.5 scroll-mt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" /> Dati Generali & Paga Oraria Base
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome Lavoratore/trice
                </label>
                <input
                  type="text"
                  placeholder="es. Valerio"
                  value={formData.nomeLavoratore || ''}
                  onChange={(e) => handleChange('nomeLavoratore', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Azienda / Locale
                </label>
                <input
                  type="text"
                  placeholder="es. Burger King"
                  value={formData.nomeAzienda || ''}
                  onChange={(e) => handleChange('nomeAzienda', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Ore Settimanali Contratto
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="es. 24"
                    value={formData.oreSettimanali || ''}
                    onChange={(e) => handleChange('oreSettimanali', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm sm:text-base font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-3 text-xs sm:text-sm text-slate-400 font-medium">h/sett</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Soglia per calcolo straordinari</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Paga Oraria Base (€/ora)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.pagaBaseOraria || ''}
                    onChange={(e) => handleChange('pagaBaseOraria', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800"
                  />
                  <span className="absolute right-3 top-3 text-xs sm:text-sm text-slate-400 font-medium">€/h</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Imponibile orario lordo da CCNL</p>
              </div>
            </div>
          </div>

          {/* 2. SEZIONE MAGGIORAZIONI ORARIE & TRATTENUTE */}
          <div id="sec-maggiorazioni" className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800 scroll-mt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-500" /> Maggiorazioni Orarie & Trattenute Stimate
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 sm:p-4 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200">
                    Bonus NOTTE (€/h)
                  </label>
                  {(formData.oraInizioNotte || formData.oraFineNotte) && (
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-900/60 px-2 py-0.5 rounded">
                      {formData.oraInizioNotte || '00:00'} - {formData.oraFineNotte || '00:00'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusNotturno || ''}
                    onChange={(e) => handleChange('bonusNotturno', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm font-semibold border border-indigo-200 dark:border-indigo-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-indigo-400 font-medium">€/h</span>
                </div>

                {/* Fascia Oraria Notte configurabile dall'utente */}
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                  <span className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                    Fascia oraria notturna:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Dalle ore
                      </label>
                      <input
                        type="time"
                        value={formData.oraInizioNotte || ''}
                        onChange={(e) => handleChange('oraInizioNotte', e.target.value)}
                        className="w-full p-2 text-xs sm:text-sm font-semibold border border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Alle ore
                      </label>
                      <input
                        type="time"
                        value={formData.oraFineNotte || ''}
                        onChange={(e) => handleChange('oraFineNotte', e.target.value)}
                        className="w-full p-2 text-xs sm:text-sm font-semibold border border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <label className="block text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-300 mb-1.5">
                  Bonus Straordinario / Supp.
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusSupplementare || ''}
                    onChange={(e) => handleChange('bonusSupplementare', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm font-semibold border border-emerald-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-emerald-400 font-medium">€/h</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-blue-50/50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60">
                <label className="block text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-300 mb-1.5">
                  Bonus DOMENICA
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusDomenicale || ''}
                    onChange={(e) => handleChange('bonusDomenicale', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm font-semibold border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-blue-400 font-medium">€/h</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-rose-50/50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/60">
                <label className="block text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-300 mb-1.5">
                  Bonus FESTIVITÀ Rossa
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusFestivo || ''}
                    onChange={(e) => handleChange('bonusFestivo', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm font-semibold border border-rose-200 dark:border-rose-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-rose-400 font-medium">€/h</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Stima Trattenute (%)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Percentuale media INPS/IRPEF per calcolare il netto stimato
                </p>
              </div>
              <div className="w-28 relative shrink-0">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="50"
                  placeholder="0"
                  value={formData.aliquotaNettoStimata || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange('aliquotaNettoStimata', val === '' ? 0 : parseFloat(val) || 0);
                  }}
                  className="w-full p-2.5 text-sm font-bold text-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-slate-400 font-bold">%</span>
              </div>
            </div>

            {/* Maggiorazioni Orarie Personalizzate (€/h) */}
            <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Maggiorazioni Orarie Personalizzate (€/h)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Aggiungi indennità orarie specifiche (es. Turno Spezzato, Bonus Cassa/Rischio, 6° Giorno)
                  </p>
                </div>
              </div>

              {/* Elenco Maggiorazioni Create */}
              {formData.maggiorazioniOrariePersonalizzate && formData.maggiorazioniOrariePersonalizzate.length > 0 && (
                <div className="space-y-1.5">
                  {formData.maggiorazioniOrariePersonalizzate.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs shadow-2xs transition-colors ${
                        editingMaggiorazioneId === m.id
                          ? 'bg-amber-100/60 dark:bg-amber-950/70 border-amber-400 dark:border-amber-700'
                          : 'bg-white dark:bg-slate-800/90 border-amber-200/60 dark:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{m.nome}</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-[11px]">
                            +{m.importoOrario.toFixed(2)} €/h
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span className={m.applicaDefault ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                            {m.applicaDefault ? '⚡ Applicata in automatico a tutti i turni' : '🔘 Selezionabile nei singoli turni'}
                          </span>
                          {m.descrizione && <span>• {m.descrizione}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditCustomMaggiorazione(m)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            editingMaggiorazioneId === m.id
                              ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                              : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title="Modifica maggiorazione"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomMaggiorazione(m.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                          title="Elimina maggiorazione"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Nuova / Modifica Maggiorazione Oraria */}
              <div
                id="maggiorazione-form-box"
                className={`p-3 rounded-xl border space-y-2.5 transition-colors ${
                  editingMaggiorazioneId
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {editingMaggiorazioneId ? (
                      <>
                        <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-amber-700 dark:text-amber-300">Modifica Maggiorazione Oraria:</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Aggiungi Nuova Maggiorazione Oraria:</span>
                      </>
                    )}
                  </span>
                  {editingMaggiorazioneId && (
                    <button
                      type="button"
                      onClick={handleCancelEditCustomMaggiorazione}
                      className="text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                    >
                      Annulla modifica
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                      Nome Maggiorazione
                    </label>
                    <input
                      type="text"
                      placeholder="es. Indennità Spezzato, Bonus Cassa"
                      value={newMaggiorazioneNome}
                      onChange={(e) => setNewMaggiorazioneNome(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                      Importo Orario Lordo
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="es. 1.50"
                        value={newMaggiorazioneTariffa}
                        onChange={(e) => setNewMaggiorazioneTariffa(e.target.value)}
                        className="w-full p-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-medium">€/h</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <label className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMaggiorazioneApplicaDefault}
                      onChange={(e) => setNewMaggiorazioneApplicaDefault(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded-md border-slate-300 focus:ring-amber-500"
                    />
                    <span>Applica in automatico a tutti i turni lavorati</span>
                  </label>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {editingMaggiorazioneId && (
                      <button
                        type="button"
                        onClick={handleCancelEditCustomMaggiorazione}
                        className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Annulla
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddCustomMaggiorazione}
                      disabled={!newMaggiorazioneNome.trim() || !(parseFloat(newMaggiorazioneTariffa) > 0)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      {editingMaggiorazioneId ? (
                        <>
                          <Save className="w-3.5 h-3.5" /> Salva Modifiche
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Salva Maggiorazione
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SEZIONE 13ª, 14ª, BONUS RENZI & L. 207/2024 */}
          <div id="sec-ratei" className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800 scroll-mt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" /> Tredicesima, Quattordicesima & Bonus di Legge
            </h3>

            <div className="space-y-3.5">
              {/* Tredicesima */}
              <div className="p-3.5 sm:p-4 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeTredicesimaMensile}
                      onChange={(e) => handleChange('includeTredicesimaMensile', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-slate-300 focus:ring-amber-500"
                    />
                    Tredicesima (13ª)
                  </label>
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded">
                    Lordo
                  </span>
                </div>

                {formData.includeTredicesimaMensile && (
                  <div className="space-y-2.5 pl-6 pt-1">
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaTredicesima', 'mensile')}
                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer ${
                          formData.modalitaTredicesima !== 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700 font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        A rate mensili (1/12 ogni mese)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaTredicesima', 'annuale')}
                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer ${
                          formData.modalitaTredicesima === 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700 font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        In unica soluzione annuale (a Dicembre)
                      </button>
                    </div>

                    {formData.modalitaTredicesima === 'annuale' ? (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Importo annuale totale (Dicembre):</span>
                        <div className="relative w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoTredicesimaAnnuale ?? ((formData.importoTredicesimaMensile ?? 53.84) * 12)}
                            onChange={(e) => handleChange('importoTredicesimaAnnuale', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-sm font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-2 text-xs sm:text-sm text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Importo lordo ogni mese:</span>
                        <div className="relative w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoTredicesimaMensile ?? 53.84}
                            onChange={(e) => handleChange('importoTredicesimaMensile', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-sm font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-2 text-xs sm:text-sm text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quattordicesima */}
              <div className="p-3.5 sm:p-4 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeQuattordicesimaMensile}
                      onChange={(e) => handleChange('includeQuattordicesimaMensile', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-slate-300 focus:ring-amber-500"
                    />
                    Quattordicesima (14ª)
                  </label>
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded">
                    Lordo
                  </span>
                </div>

                {formData.includeQuattordicesimaMensile && (
                  <div className="space-y-2.5 pl-6 pt-1">
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaQuattordicesima', 'mensile')}
                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer ${
                          formData.modalitaQuattordicesima !== 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700 font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        A rate mensili (1/12 ogni mese)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaQuattordicesima', 'annuale')}
                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer ${
                          formData.modalitaQuattordicesima === 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700 font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        In unica soluzione annuale (a Giugno)
                      </button>
                    </div>

                    {formData.modalitaQuattordicesima === 'annuale' ? (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Importo annuale totale (Giugno/Luglio):</span>
                        <div className="relative w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoQuattordicesimaAnnuale ?? ((formData.importoQuattordicesimaMensile ?? 53.84) * 12)}
                            onChange={(e) => handleChange('importoQuattordicesimaAnnuale', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-sm font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-2 text-xs sm:text-sm text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Importo lordo ogni mese:</span>
                        <div className="relative w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoQuattordicesimaMensile ?? 53.84}
                            onChange={(e) => handleChange('importoQuattordicesimaMensile', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-sm font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-2 text-xs sm:text-sm text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bonus Renzi */}
              <div className="p-3.5 sm:p-4 bg-teal-50/50 dark:bg-teal-950/30 rounded-xl border border-teal-200/70 dark:border-teal-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-950 dark:text-teal-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeBonusRenzi}
                      onChange={(e) => handleChange('includeBonusRenzi', e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
                    />
                    Bonus Renzi (Trattamento Integrativo)
                  </label>
                  <span className="text-xs bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded">
                    100% Netto
                  </span>
                </div>
                {formData.includeBonusRenzi && (
                  <div className="flex items-center justify-between pl-6 gap-2 text-xs sm:text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Importo netto mensile:</span>
                    <div className="relative w-32">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.importoBonusRenzi ?? 98.63}
                        onChange={(e) => handleChange('importoBonusRenzi', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 text-sm font-bold border border-teal-300 dark:border-teal-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-3 top-2 text-xs sm:text-sm text-slate-400 font-medium">€</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SOMMA ART.1 C.4 L.207/24 */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/80 dark:border-amber-700/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeBonusL207}
                      onChange={(e) => handleChange('includeBonusL207', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-slate-300 focus:ring-amber-500"
                    />
                    Somma Art. 1 c. 4 L. 207/2024 (Cuneo Fiscale 2025)
                  </label>
                  <span className="text-xs bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded">
                    100% Netto Esente
                  </span>
                </div>

                {formData.includeBonusL207 && (
                  <div className="space-y-3 pl-6 pt-1 text-xs sm:text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaBonusL207', 'fisso')}
                        className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer text-xs sm:text-sm ${
                          formData.modalitaBonusL207 !== 'percentuale'
                            ? 'bg-amber-600 text-white border-amber-700 font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Valore Fisso in Euro
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaBonusL207', 'percentuale')}
                        className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer text-xs sm:text-sm ${
                          formData.modalitaBonusL207 === 'percentuale'
                            ? 'bg-amber-600 text-white border-amber-700 font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Aliquota % da Scaglione
                      </button>
                    </div>

                    {formData.modalitaBonusL207 === 'percentuale' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Scaglione di reddito presunto:</span>
                          <select
                            value={formData.scaglioneBonusL207 || '15000'}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              let perc = 5.3;
                              if (val === '8500') perc = 7.1;
                              if (val === '20000') perc = 4.8;
                              handleChange('scaglioneBonusL207', val);
                              handleChange('percentualeBonusL207', perc);
                            }}
                            className="p-2 text-xs sm:text-sm font-semibold border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="8500">Fino a 8.500 € (7,1%)</option>
                            <option value="15000">8.500 € - 15.000 € (5,3%)</option>
                            <option value="20000">15.000 € - 20.000 € (4,8%)</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Quota mensile fissa riconosciuta:</span>
                        <div className="relative w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoBonusL207Fisso ?? 45.22}
                            onChange={(e) => handleChange('importoBonusL207Fisso', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-sm font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-2 text-xs sm:text-sm text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. SEZIONE FERIE & MATURAZIONE */}
          <div id="sec-ferie" className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800 scroll-mt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-amber-500" /> Parametri Maturazione Ferie
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Giorni Ferie al Mese
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="es. 2.16"
                    value={formData.ferieAccumuloMensile || ''}
                    onChange={(e) => handleChange('ferieAccumuloMensile', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-slate-400 font-medium">gg/m</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maturati per ogni mese lavorato</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Saldo Iniziale Ferie (Arretrati)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={formData.ferieResiduoIniziale ?? 0}
                    onChange={(e) => handleChange('ferieResiduoIniziale', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-slate-400 font-medium">giorni</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Giorni già accumulati in precedenza</p>
              </div>
            </div>
          </div>

          {/* 5. SEZIONE VOCI & BONUS PERSONALIZZATI */}
          <div id="sec-voci" className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800 scroll-mt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Voci & Bonus Personalizzati Busta Paga
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3.5">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Aggiungi qui eventuali indennità di cassa, ticket restaurant, premi produzione o superminimi erogati ogni mese fisso oppure ogni tot mesi (bimestrale, trimestrale, ecc.).
              </p>

              {/* Elenco Voci Esistenti */}
              {formData.vociPersonalizzate && formData.vociPersonalizzate.length > 0 && (
                <div className="space-y-2.5">
                  {formData.vociPersonalizzate.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-2xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{v.nome}</span>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {v.tipo === 'ogni_tot_mesi'
                              ? `Ogni ${v.intervalloMesi || 1} mesi (mesi: ${getComputedMonthsList(v.intervalloMesi || 1, v.meseInizio || 1)})`
                              : 'Ogni mese (fisso)'}
                          </span>
                          <span>•</span>
                          <span className={v.tassabile ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                            {v.tassabile ? 'Lordo soggetto a ritenuta' : '100% Netto Esente'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-slate-900 dark:text-white font-mono text-sm sm:text-base">
                          +€{v.importo.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomVoce(v.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Elimina voce"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Aggiungi nuova voce */}
              <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Aggiungi nuova voce al cedolino:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome voce (es. Indennità Cassa, Buoni Pasto, Premio)"
                    value={newVoceNome}
                    onChange={(e) => setNewVoceNome(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Importo in euro (es. 50.00)"
                      value={newVoceImporto}
                      onChange={(e) => setNewVoceImporto(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <span className="absolute right-3 top-2.5 text-xs sm:text-sm text-slate-400 font-medium">€</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Frequenza di erogazione in busta:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => setNewVoceTipo('mensile')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-semibold ${
                        newVoceTipo === 'mensile'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Mensile fisso (ogni mese)
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewVoceTipo('ogni_tot_mesi')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-semibold ${
                        newVoceTipo === 'ogni_tot_mesi'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Ogni tot mesi (periodico)
                    </button>
                  </div>

                  {newVoceTipo === 'ogni_tot_mesi' && (
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-blue-950 dark:text-blue-200 mb-1">
                            Ogni quanti mesi?
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max="12"
                              placeholder="es. 2, 3, 6"
                              value={newVoceIntervallo}
                              onChange={(e) => setNewVoceIntervallo(e.target.value)}
                              className="w-full p-2 text-xs sm:text-sm font-bold border border-blue-300 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                            <span className="absolute right-3 top-2 text-xs text-blue-400 font-medium">mesi</span>
                          </div>
                          <div className="flex gap-1.5 mt-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => { setNewVoceIntervallo('2'); setNewVoceMeseInizio('2'); }}
                              className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-medium cursor-pointer"
                            >
                              Bimestrale (2)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setNewVoceIntervallo('3'); setNewVoceMeseInizio('3'); }}
                              className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-medium cursor-pointer"
                            >
                              Trimestrale (3)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setNewVoceIntervallo('6'); setNewVoceMeseInizio('6'); }}
                              className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-medium cursor-pointer"
                            >
                              Semestrale (6)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-blue-950 dark:text-blue-200 mb-1">
                            A partire dal mese di:
                          </label>
                          <select
                            value={newVoceMeseInizio}
                            onChange={(e) => setNewVoceMeseInizio(e.target.value)}
                            className="w-full p-2 text-xs sm:text-sm font-semibold border border-blue-300 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            {NOMI_MESI.map((nome, idx) => (
                              <option key={nome} value={String(idx + 1)}>
                                {nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="text-xs text-blue-900 dark:text-blue-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-blue-200/80 dark:border-blue-900/40">
                        <strong>📅 Mesi di accredito:</strong>{' '}
                        {getComputedMonthsList(parseInt(newVoceIntervallo, 10) || 1, parseInt(newVoceMeseInizio, 10) || 1)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                  <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={newVoceTassabile}
                      onChange={(e) => setNewVoceTassabile(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Soggetto a ritenute fiscali (lordo)</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddCustomVoce}
                    disabled={!newVoceNome.trim() || !newVoceImporto}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Aggiungi Voce
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. SEZIONE PRESET ORARI DI LAVORO RAPIDI */}
          <div id="sec-preset" className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800 scroll-mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Preset Orari di Lavoro Rapidi
              </h3>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                {localTemplates.length} attivi
              </span>
            </div>

            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 space-y-3.5">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                I preset ti consentono di compilare in un istante i tuoi turni abituali (es. <em>Apertura</em>, <em>Turno Pranzo</em>, <em>Chiusura Notte</em>) sia dal calendario che dalla schermata di inserimento. Puoi crearne quanti ne vuoi o modificare quelli standard.
              </p>

              {/* Feedback Notifica aggiunta/eliminazione */}
              {presetFeedback && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fadeIn font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {presetFeedback}
                </div>
              )}

              {/* Elenco Preset Esistenti */}
              <div className="space-y-2.5">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 block">
                  I tuoi Preset Attivi:
                </span>

                {localTemplates.length === 0 ? (
                  <div className="p-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    Nessun preset configurato. Creane uno qui sotto o ripristina quelli standard!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {localTemplates.map((t) => {
                      const dur = computePresetDuration(
                        t.orarioInizio,
                        t.orarioFine,
                        t.pausaMinuti,
                        formData.oraInizioNotte,
                        formData.oraFineNotte
                      );
                      return (
                        <div
                          key={t.id}
                          className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                                {t.titolo}
                              </strong>
                              {t.note && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {t.note}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditPreset(t)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  editingPresetId === t.id
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                                    : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                                title="Modifica preset"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePreset(t.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Elimina preset"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                              {t.orarioInizio} - {t.orarioFine}
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                              {t.pausaMinuti > 0 && (
                                <span className="text-slate-500 dark:text-slate-400">
                                  Pausa {t.pausaMinuti}m
                                </span>
                              )}
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {dur.oreTotali}h
                              </span>
                              {dur.oreNotturne > 0 && (
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5" title={`${dur.oreNotturne}h notturne`}>
                                  <Moon className="w-3 h-3" /> {dur.oreNotturne}h
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleResetDefaultPresets}
                    className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Ripristina 2 preset standard
                  </button>
                </div>
              </div>

              {/* Form Nuovo Preset / Modifica Preset */}
              <div id="preset-form-box" className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
                editingPresetId
                  ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {editingPresetId ? (
                      <>
                        <Pencil className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-700 dark:text-amber-300">Modifica Preset:</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Crea Nuovo Preset di Orario:</span>
                      </>
                    )}
                  </span>
                  {editingPresetId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPreset}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                    >
                      Annulla modifica
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nome Preset
                    </label>
                    <input
                      type="text"
                      placeholder="es. Apertura Mattina, Turno Notte 2..."
                      value={newPresetTitolo}
                      onChange={(e) => setNewPresetTitolo(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mansione o Note (opzionale)
                    </label>
                    <input
                      type="text"
                      placeholder="es. Cassa, Caffetteria, Pulizia..."
                      value={newPresetNote}
                      onChange={(e) => setNewPresetNote(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ora Inizio
                    </label>
                    <input
                      type="time"
                      value={newPresetInizio}
                      onChange={(e) => setNewPresetInizio(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ora Fine
                    </label>
                    <input
                      type="time"
                      value={newPresetFine}
                      onChange={(e) => setNewPresetFine(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pausa (min)
                    </label>
                    <select
                      value={newPresetPausa}
                      onChange={(e) => setNewPresetPausa(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="0">0 min (Nessuna)</option>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min (1 ora)</option>
                    </select>
                  </div>
                </div>

                {/* Anteprima Durata Calcolata */}
                <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>
                      Durata netta: <strong>{previewPresetDuration.oreTotali} ore</strong>
                      {previewPresetDuration.oreNotturne > 0 && (
                        <span className="ml-1.5 text-indigo-700 dark:text-indigo-300">
                          (di cui <strong>{previewPresetDuration.oreNotturne}h notturne</strong>)
                        </span>
                      )}
                    </span>
                  </div>

                  {editingPresetId ? (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleCancelEditPreset}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Annulla
                      </button>
                      <button
                        type="button"
                        onClick={handleAddPreset}
                        disabled={!newPresetTitolo.trim() || !newPresetInizio || !newPresetFine}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" /> Salva Modifiche
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddPreset}
                      disabled={!newPresetTitolo.trim() || !newPresetInizio || !newPresetFine}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0 self-end sm:self-auto"
                    >
                      <Plus className="w-4 h-4" /> Salva Preset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 7. MANUTENZIONE & RESET */}
          <div id="sec-reset" className="pt-4 border-t border-slate-200 dark:border-slate-800 scroll-mt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-2.5">
              <RotateCcw className="w-4 h-4 text-rose-500" /> Manutenzione & Reset Storico
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Vuoi svuotare i turni salvati sul calendario senza toccare le tariffe?
              </span>
              <button
                type="button"
                onClick={onResetShiftsOnly}
                className="px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900/60 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-4 h-4" /> Svuota Turni
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions - Sticky & Responsive */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            {successMsg ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Configurazione Salvata!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salva Tariffe & Preset
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
