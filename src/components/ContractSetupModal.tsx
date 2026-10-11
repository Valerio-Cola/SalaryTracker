import React, { useState } from 'react';
import { ContractConfig, CustomAllowance } from '../types';
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

interface ContractSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ContractConfig;
  onSave: (newConfig: ContractConfig) => void;
  onResetShiftsOnly: () => void;
}

export const ContractSetupModal: React.FC<ContractSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onResetShiftsOnly,
}) => {
  const [formData, setFormData] = useState<ContractConfig>({
    ...config,
    vociPersonalizzate: config.vociPersonalizzate || [],
  });
  const [successMsg, setSuccessMsg] = useState(false);

  // Stato per nuova voce personalizzata
  const [newVoceNome, setNewVoceNome] = useState('');
  const [newVoceImporto, setNewVoceImporto] = useState('');
  const [newVoceTipo, setNewVoceTipo] = useState<'mensile' | 'ogni_tot_mesi'>('mensile');
  const [newVoceIntervallo, setNewVoceIntervallo] = useState('3');
  const [newVoceMeseInizio, setNewVoceMeseInizio] = useState('3');
  const [newVoceTassabile, setNewVoceTassabile] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof ContractConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

    // Reset input
    setNewVoceNome('');
    setNewVoceImporto('');
  };

  const handleRemoveCustomVoce = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      vociPersonalizzate: (prev.vociPersonalizzate || []).filter((v) => v.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">Configurazione Tariffe & Contratto</h2>
              <p className="text-xs text-slate-300">Imposta paga base, bonus di legge, 13ª/14ª e ferie</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[78vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
          {/* Dati Generali */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Lavoratore/trice</label>
              <input
                type="text"
                placeholder="es. Valerio"
                value={formData.nomeLavoratore || ''}
                onChange={(e) => handleChange('nomeLavoratore', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Azienda / Locale</label>
              <input
                type="text"
                placeholder="es. Burger King"
                value={formData.nomeAzienda || ''}
                onChange={(e) => handleChange('nomeAzienda', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Ore settimanali e Paga Base */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Ore Settimanali Contratto
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  placeholder="24"
                  value={formData.oreSettimanali || ''}
                  onChange={(e) => handleChange('oreSettimanali', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">h/sett</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Soglia per calcolo straordinari</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Paga Oraria Base (€/ora)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.pagaBaseOraria || ''}
                  onChange={(e) => handleChange('pagaBaseOraria', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">€/h</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Imponibile orario lordo da CCNL</p>
            </div>
          </div>

          {/* Maggiorazioni Orarie */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Maggiorazioni e Bonus Orari (€/ora)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                <label className="block text-xs font-medium text-indigo-950 dark:text-indigo-300 mb-1">
                  Bonus NOTTE (22:00-06:00)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusNotturno || ''}
                    onChange={(e) => handleChange('bonusNotturno', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-indigo-400">€/h</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <label className="block text-xs font-medium text-emerald-950 dark:text-emerald-300 mb-1">
                  Bonus Straordinario / Supp.
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusSupplementare || ''}
                    onChange={(e) => handleChange('bonusSupplementare', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-emerald-400">€/h</span>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60">
                <label className="block text-xs font-medium text-blue-950 dark:text-blue-300 mb-1">
                  Bonus DOMENICA
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusDomenicale || ''}
                    onChange={(e) => handleChange('bonusDomenicale', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs font-semibold border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-blue-400">€/h</span>
                </div>
              </div>

              <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/60">
                <label className="block text-xs font-medium text-rose-950 dark:text-rose-300 mb-1">
                  Bonus FESTIVITÀ Rossa
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.bonusFestivo || ''}
                    onChange={(e) => handleChange('bonusFestivo', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs font-semibold border border-rose-200 dark:border-rose-800 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-rose-400">€/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trattenute Stimate */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Stima Trattenute (%)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Percentuale media INPS/IRPEF per calcolare il netto stimato</p>
            </div>
            <div className="w-24 relative">
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={formData.aliquotaNettoStimata}
                onChange={(e) => handleChange('aliquotaNettoStimata', parseFloat(e.target.value) || 0)}
                className="w-full p-2 text-xs font-bold text-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="absolute right-2 top-2 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* SEZIONE BONUS (13ª, 14ª, Renzi, Art. 1 C.4 L.207/24 e Bonus Personalizzati) */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> Bonus
              </h3>
            </div>

            <div className="space-y-3">
              {/* Tredicesima */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeTredicesimaMensile}
                      onChange={(e) => handleChange('includeTredicesimaMensile', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-slate-300 focus:ring-amber-500"
                    />
                    Tredicesima (13ª)
                  </label>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">Lordo</span>
                </div>

                {formData.includeTredicesimaMensile && (
                  <div className="space-y-2 pl-6 pt-1">
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaTredicesima', 'mensile')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                          formData.modalitaTredicesima !== 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        A rate mensili (1/12 ogni mese)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaTredicesima', 'annuale')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                          formData.modalitaTredicesima === 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        In unica soluzione annuale (a Dicembre)
                      </button>
                    </div>

                    {formData.modalitaTredicesima === 'annuale' ? (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Importo annuale totale (Dicembre):</span>
                        <div className="relative w-28">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoTredicesimaAnnuale ?? ((formData.importoTredicesimaMensile ?? 53.84) * 12)}
                            onChange={(e) => handleChange('importoTredicesimaAnnuale', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 text-xs font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Importo lordo ogni mese:</span>
                        <div className="relative w-28">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoTredicesimaMensile ?? 53.84}
                            onChange={(e) => handleChange('importoTredicesimaMensile', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 text-xs font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quattordicesima */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeQuattordicesimaMensile}
                      onChange={(e) => handleChange('includeQuattordicesimaMensile', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-slate-300 focus:ring-amber-500"
                    />
                    Quattordicesima (14ª)
                  </label>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">Lordo</span>
                </div>

                {formData.includeQuattordicesimaMensile && (
                  <div className="space-y-2 pl-6 pt-1">
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaQuattordicesima', 'mensile')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                          formData.modalitaQuattordicesima !== 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        A rate mensili (1/12 ogni mese)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaQuattordicesima', 'annuale')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                          formData.modalitaQuattordicesima === 'annuale'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        In unica soluzione annuale (a Giugno)
                      </button>
                    </div>

                    {formData.modalitaQuattordicesima === 'annuale' ? (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Importo annuale totale (Giugno/Luglio):</span>
                        <div className="relative w-28">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoQuattordicesimaAnnuale ?? ((formData.importoQuattordicesimaMensile ?? 53.84) * 12)}
                            onChange={(e) => handleChange('importoQuattordicesimaAnnuale', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 text-xs font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Importo lordo ogni mese:</span>
                        <div className="relative w-28">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoQuattordicesimaMensile ?? 53.84}
                            onChange={(e) => handleChange('importoQuattordicesimaMensile', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 text-xs font-bold border border-amber-300 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bonus Renzi */}
              <div className="p-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-xl border border-teal-200/70 dark:border-teal-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-teal-950 dark:text-teal-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeBonusRenzi}
                      onChange={(e) => handleChange('includeBonusRenzi', e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
                    />
                    Bonus Renzi (Trattamento Integrativo)
                  </label>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold px-1.5 py-0.5 rounded">100% Netto</span>
                </div>
                {formData.includeBonusRenzi && (
                  <div className="flex items-center justify-between pl-6 gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Importo netto mensile:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.importoBonusRenzi ?? 98.63}
                        onChange={(e) => handleChange('importoBonusRenzi', parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 text-xs font-bold border border-teal-300 dark:border-teal-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-medium">€</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SOMMA ART.1 C.4 L.207/24 (Subito sotto il Bonus Renzi) */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/80 dark:border-amber-700/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.includeBonusL207}
                      onChange={(e) => handleChange('includeBonusL207', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-slate-300 focus:ring-amber-500"
                    />
                    <span>SOMMA ART.1 C.4 L.207/24 (Nuovo Bonus 2025)</span>
                  </label>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    100% Netto Esente
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 dark:text-amber-300/90 leading-relaxed">
                  Nuovo bonus introdotto dalla <strong>Legge n. 207/2024</strong> (sostituisce il taglio del cuneo fiscale) per redditi fino a 20.000€. <strong>Esente da tasse e contributi</strong> (non fa cumulo con il reddito).
                </p>

                {formData.includeBonusL207 && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/80 dark:border-amber-800/80">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaBonusL207', 'fisso')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.modalitaBonusL207 === 'fisso' || !formData.modalitaBonusL207
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Importo Fisso da Busta
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('modalitaBonusL207', 'percentuale')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.modalitaBonusL207 === 'percentuale'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Calcolo % su Retribuzione
                      </button>
                    </div>

                    {formData.modalitaBonusL207 !== 'percentuale' ? (
                      <div className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">Importo netto in busta:</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Es. 45,22 € come nel cedolino di settembre</span>
                        </div>
                        <div className="relative w-28">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.importoBonusL207Fisso ?? 45.22}
                            onChange={(e) => handleChange('importoBonusL207Fisso', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 text-xs font-bold border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-medium">€</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800">
                        <label className="block text-xs font-bold text-slate-900 dark:text-white">
                          Scaglione di Reddito Annuo (Legge 207/2024):
                        </label>
                        <select
                          value={formData.scaglioneBonusL207 || '15000'}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            handleChange('scaglioneBonusL207', val);
                            if (val === '8500') handleChange('percentualeBonusL207', 7.1);
                            else if (val === '15000') handleChange('percentualeBonusL207', 5.3);
                            else if (val === '20000') handleChange('percentualeBonusL207', 4.8);
                          }}
                          className="w-full p-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="8500">7,1% - Redditi fino a 8.500 € annui</option>
                          <option value="15000">5,3% - Redditi da 8.501 € a 15.000 € (Consigliato Part-Time / Crew)</option>
                          <option value="20000">4,8% - Redditi da 15.001 € a 20.000 €</option>
                        </select>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                          La percentuale verrà applicata automaticamente all'imponibile del mese e accreditata come netto esente.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bonus e Voci Personalizzate Autonome (Ancora più sotto di Art. 1) */}
              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Bonus & Voci Personalizzabili
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Indennità, ticket o premi</span>
                </div>

                {/* Elenco voci esistenti */}
                {formData.vociPersonalizzate && formData.vociPersonalizzate.length > 0 && (
                  <div className="space-y-2">
                    {formData.vociPersonalizzate.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{v.nome}</span>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {v.tipo === 'ogni_tot_mesi'
                                ? `Ogni ${v.intervalloMesi || 1} mesi (mesi: ${getComputedMonthsList(v.intervalloMesi || 1, v.meseInizio || 1)})`
                                : v.tipo === 'mensile' || !v.tipo
                                ? 'Ogni mese (fisso)'
                                : `Solo mese ${v.meseUnaTantum || 'selezionato'}`}
                            </span>
                            <span>•</span>
                            <span className={v.tassabile ? 'text-amber-600' : 'text-emerald-600 font-semibold'}>
                              {v.tassabile ? 'Lordo soggetto a ritenuta' : '100% Netto Esente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                            +€{v.importo.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomVoce(v.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                            title="Elimina voce"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Aggiungi nuova voce */}
                <div className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Aggiungi nuova voce al cedolino:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome voce (es. Indennità Cassa, Buoni Pasto, Premio)"
                      value={newVoceNome}
                      onChange={(e) => setNewVoceNome(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />

                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Importo in euro (es. 50.00)"
                        value={newVoceImporto}
                        onChange={(e) => setNewVoceImporto(e.target.value)}
                        className="w-full p-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-medium">€</span>
                    </div>
                  </div>

                  {/* Frequenza di accredito */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                      Frequenza di erogazione in busta:
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setNewVoceTipo('mensile')}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer font-medium ${
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
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                          newVoceTipo === 'ogni_tot_mesi'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Ogni tot mesi (periodico)
                      </button>
                    </div>

                    {/* Se Ogni TOT Mesi selezionato */}
                    {newVoceTipo === 'ogni_tot_mesi' && (
                      <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-blue-950 dark:text-blue-200 mb-1">
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
                                className="w-full p-1.5 text-xs font-bold border border-blue-300 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              />
                              <span className="absolute right-2.5 top-1.5 text-[11px] text-blue-400 font-medium">mesi</span>
                            </div>
                            <div className="flex gap-1 mt-1 text-[10px]">
                              <button
                                type="button"
                                onClick={() => { setNewVoceIntervallo('2'); setNewVoceMeseInizio('2'); }}
                                className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 cursor-pointer"
                              >
                                Bimestrale (2)
                              </button>
                              <button
                                type="button"
                                onClick={() => { setNewVoceIntervallo('3'); setNewVoceMeseInizio('3'); }}
                                className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 cursor-pointer"
                              >
                                Trimestrale (3)
                              </button>
                              <button
                                type="button"
                                onClick={() => { setNewVoceIntervallo('6'); setNewVoceMeseInizio('6'); }}
                                className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 cursor-pointer"
                              >
                                Semestrale (6)
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-blue-950 dark:text-blue-200 mb-1">
                              A partire dal mese di:
                            </label>
                            <select
                              value={newVoceMeseInizio}
                              onChange={(e) => setNewVoceMeseInizio(e.target.value)}
                              className="w-full p-1.5 text-xs font-semibold border border-blue-300 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                              {NOMI_MESI.map((nome, idx) => (
                                <option key={nome} value={String(idx + 1)}>
                                  {nome}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Anteprima automatica dei mesi */}
                        <div className="text-[10px] text-blue-900 dark:text-blue-300 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-blue-200/80 dark:border-blue-900/40">
                          <strong>📅 Mesi di accredito:</strong>{' '}
                          {getComputedMonthsList(parseInt(newVoceIntervallo, 10) || 1, parseInt(newVoceMeseInizio, 10) || 1)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                      <input
                        type="checkbox"
                        checked={newVoceTassabile}
                        onChange={(e) => setNewVoceTassabile(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span>Soggetto a ritenute fiscali (lordo)</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddCustomVoce}
                      disabled={!newVoceNome.trim() || !newVoceImporto}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Aggiungi Voce
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parametri Maturazione Ferie */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Palmtree className="w-3.5 h-3.5 text-amber-500" /> Parametri Maturazione Ferie
            </h3>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Giorni Ferie al Mese
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2.16"
                    value={formData.ferieAccumuloMensile ?? 2.16}
                    onChange={(e) => handleChange('ferieAccumuloMensile', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-slate-400 font-medium">gg/m</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Maturati per ogni mese lavorato</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Saldo Iniziale Ferie (Arretrati)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={formData.ferieResiduoIniziale ?? 0}
                    onChange={(e) => handleChange('ferieResiduoIniziale', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-slate-400 font-medium">giorni</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Giorni già accumulati in precedenza</p>
              </div>
            </div>
          </div>

          {/* Reset Storico */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Vuoi azzerare i turni salvati sul calendario?</span>
            <button
              type="button"
              onClick={onResetShiftsOnly}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Svuota Turni
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {successMsg ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Salvato!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salva Tariffe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
