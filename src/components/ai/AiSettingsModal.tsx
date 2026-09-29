import React, { useState } from 'react';
import { X, Sparkles, Key, Cpu, ShieldCheck, Check } from 'lucide-react';
import { AiSettings } from '../../types/ai';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AiSettings;
  onSaveSettings: (settings: AiSettings) => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [engine, setEngine] = useState<'local' | 'gemini'>(settings.engine);
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.geminiModel || 'gemini-1.5-flash');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      engine,
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
      voiceEnabled: true,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-card-dark dark:bg-card-dark light:bg-white rounded-3xl border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-primary/20 text-accent-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                AI Copilot Settings
              </h3>
              <p className="text-[11px] text-text-secondary">Configure intelligence engine & keys</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Engine Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary">Intelligence Engine</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEngine('local')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  engine === 'local'
                    ? 'border-accent-primary bg-accent-primary/10 ring-1 ring-accent-primary'
                    : 'border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-200 bg-background-dark/40 dark:bg-background-dark/40 light:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                  <Cpu className="w-4 h-4 text-accent-primary" />
                  <span>Local Smart Engine</span>
                </div>
                <p className="text-[10px] text-text-secondary mt-1">
                  100% Free & Offline. Instant response, zero API key required.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEngine('gemini')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  engine === 'gemini'
                    ? 'border-accent-primary bg-accent-primary/10 ring-1 ring-accent-primary'
                    : 'border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-200 bg-background-dark/40 dark:bg-background-dark/40 light:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                  <Sparkles className="w-4 h-4 text-financial-income" />
                  <span>Google Gemini API</span>
                </div>
                <p className="text-[10px] text-text-secondary mt-1">
                  Advanced LLM reasoning via Google's Generative AI models.
                </p>
              </button>
            </div>
          </div>

          {/* Gemini API Key Field (if Gemini selected) */}
          {engine === 'gemini' && (
            <div className="space-y-3 pt-2 border-t border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary dark:text-text-primary light:text-slate-800 flex items-center justify-between">
                  <span>Gemini API Key</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-accent-primary hover:underline"
                  >
                    Get a free key →
                  </a>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-background-dark/80 dark:bg-background-dark/80 light:bg-slate-50 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-text-primary dark:text-text-primary light:text-slate-900 focus:outline-none focus:border-accent-primary text-xs"
                  />
                </div>
                <p className="text-[10px] text-text-secondary">
                  Your key is stored only on this device in localStorage and is never shared.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background-dark/80 dark:bg-background-dark/80 light:bg-slate-50 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-text-primary dark:text-text-primary light:text-slate-900 focus:outline-none focus:border-accent-primary text-xs"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Recommended)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen High Performance)</option>
                </select>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-financial-income/10 border border-financial-income/20 text-text-secondary text-[11px]">
            <ShieldCheck className="w-4 h-4 text-financial-income shrink-0 mt-0.5" />
            <span>
              All transaction numbers stay completely private. When using the Local Engine, nothing ever leaves your device.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-glow-primary transition-all duration-150 active:scale-95"
            >
              {showSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{showSuccess ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
