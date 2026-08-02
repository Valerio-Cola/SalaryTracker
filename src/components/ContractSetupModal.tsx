import React, { useState } from 'react';
import { ContractConfig } from '../types';
import { X, Save, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';

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
  const [formData, setFormData] = useState<ContractConfig>({ ...config });
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof ContractConfig, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'nomeLavoratore' && field !== 'nomeAzienda' 
        ? (value === '' ? 0 : parseFloat(value) || 0)
        : value,
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-colors">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">Configurazione Contratto</h2>
              <p className="text-xs text-slate-300">Imposta ore contrattuali, paga base e bonus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
          {/* Dati Generali */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Lavoratore/trice</label>
              <input
                type="text"
                placeholder="es. Mario"
                value={formData.nomeLavoratore || ''}
                onChange={(e) => handleChange('nomeLavoratore', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Azienda / Locale</label>
              <input
                type="text"
                placeholder="es. Nome Azienda"
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
                  onChange={(e) => handleChange('oreSettimanali', e.target.value)}
                  className="w-full p-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">h/sett</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Soglia per straordinari</p>
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
                  onChange={(e) => handleChange('pagaBaseOraria', e.target.value)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-800"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">€/h</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Imponibile orario lordo</p>
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
                    onChange={(e) => handleChange('bonusNotturno', e.target.value)}
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
                    onChange={(e) => handleChange('bonusSupplementare', e.target.value)}
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
                    onChange={(e) => handleChange('bonusDomenicale', e.target.value)}
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
                    onChange={(e) => handleChange('bonusFestivo', e.target.value)}
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400">INPS/IRPEF stimata per calcolare il netto indicativo</p>
            </div>
            <div className="w-24 relative">
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={formData.aliquotaNettoStimata}
                onChange={(e) => handleChange('aliquotaNettoStimata', e.target.value)}
                className="w-full p-2 text-xs font-bold text-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="absolute right-2 top-2 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Reset Storico */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Hai bisogno di svuotare solo lo storico turni?</span>
            <button
              type="button"
              onClick={onResetShiftsOnly}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Svuota Turni
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/10 transition-all flex items-center gap-1.5"
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
