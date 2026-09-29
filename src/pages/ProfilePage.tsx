import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { CURRENCIES } from '../utils/formatters';
import { CurrencyCode, CurrencyInfo } from '../types';
import { formatDate } from '../utils/dateUtils';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import {
  User,
  Mail,
  Calendar,
  Coins,
  Palette,
  Bell,
  Sun,
  Moon,
  Monitor,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, isFirebase } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(profile?.currency || 'NGN');
  const [budgetAlerts, setBudgetAlerts] = useState(profile?.budgetAlerts ?? true);
  const [monthlySummaries, setMonthlySummaries] = useState(profile?.monthlySummaries ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        currency: selectedCurrency,
        budgetAlerts,
        monthlySummaries,
      });
      showToast('Profile and settings updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currencyOptions = Object.values(CURRENCIES).map((c: CurrencyInfo) => ({
    value: c.code,
    label: `${c.code} (${c.symbol}) — ${c.name}`,
  }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
          Manage your account credentials, currency preferences, and appearance
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 pb-4">
            <User className="w-5 h-5 text-accent-primary" />
            <h3 className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900">
              Personal Information
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar representation */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-accent-primary to-[#8B5CF6] text-white flex items-center justify-center font-extrabold text-2xl shadow-glow-primary shrink-0 ring-4 ring-white/10">
              {initials || 'U'}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h4 className="text-lg font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                {profile?.displayName || 'Spendly User'}
              </h4>
              <p className="text-xs text-text-secondary flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {profile?.email || user?.email}
              </p>
              <p className="text-xs text-text-secondary/70 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Member since {formatDate(profile?.createdAt?.split('T')[0] || '2026-01-01')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Full Name"
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              value={profile?.email || user?.email || ''}
              disabled
              helperText="Email cannot be changed directly."
            />
          </div>
        </div>

        {/* Currency Preference Card */}
        <div className="p-6 rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 pb-4">
            <Coins className="w-5 h-5 text-financial-income" />
            <h3 className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900">
              Currency Preference
            </h3>
          </div>

          <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500">
            Choose the default currency for formatting your transactions and balances across Spendly.
          </p>

          <div className="max-w-md">
            <Select
              label="Preferred Currency"
              value={selectedCurrency}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCurrency(e.target.value as CurrencyCode)}
              options={currencyOptions}
            />
          </div>
        </div>

        {/* Appearance Settings Card */}
        <div className="p-6 rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 pb-4">
            <Palette className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900">
              Appearance
            </h3>
          </div>

          <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500">
            Customize how Spendly looks on your screen.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-accent-primary/10 border-accent-primary text-text-primary'
                  : 'bg-card-dark/60 dark:bg-card-dark/60 light:bg-slate-50 border-spendlyBorder-dark hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-accent-primary" />
                <div>
                  <p className="text-xs font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                    Dark Mode
                  </p>
                  <p className="text-[10px] text-text-secondary">Default fintech theme</p>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-accent-primary" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-accent-primary/10 border-accent-primary text-text-primary dark:text-text-primary light:text-slate-900'
                  : 'bg-card-dark/60 dark:bg-card-dark/60 light:bg-slate-50 border-spendlyBorder-dark hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                    Light Mode
                  </p>
                  <p className="text-[10px] text-text-secondary">Clean paper theme</p>
                </div>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-accent-primary" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                theme === 'system'
                  ? 'bg-accent-primary/10 border-accent-primary text-text-primary'
                  : 'bg-card-dark/60 dark:bg-card-dark/60 light:bg-slate-50 border-spendlyBorder-dark hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-financial-info" />
                <div>
                  <p className="text-xs font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                    System
                  </p>
                  <p className="text-[10px] text-text-secondary">Match OS setting</p>
                </div>
              </div>
              {theme === 'system' && <Check className="w-4 h-4 text-accent-primary" />}
            </button>
          </div>
        </div>

        {/* Notifications Preferences Card */}
        <div className="p-6 rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 pb-4">
            <Bell className="w-5 h-5 text-financial-warning" />
            <h3 className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
                  Budget Alerts
                </p>
                <p className="text-[11px] text-text-secondary">
                  Notify when category spending exceeds 80% of budget
                </p>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-50 cursor-pointer">
              <div>
                <p className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
                  Monthly Summaries
                </p>
                <p className="text-[11px] text-text-secondary">
                  Generate periodic financial overview digests
                </p>
              </div>
              <input
                type="checkbox"
                checked={monthlySummaries}
                onChange={(e) => setMonthlySummaries(e.target.checked)}
                className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary"
              />
            </label>
          </div>
        </div>

        {/* Security & System Info Card */}
        <div className="p-6 rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-financial-income" />
            <h3 className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900">
              Security & Environment
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-secondary">
            <div>
              <span className="font-medium text-text-primary dark:text-text-primary light:text-slate-700">
                Backend Status:{' '}
              </span>
              <span>{isFirebase ? 'Firebase Authentication & Firestore' : 'Local Storage Mode'}</span>
            </div>
            <div>
              <span className="font-medium text-text-primary dark:text-text-primary light:text-slate-700">
                Data Privacy:{' '}
              </span>
              <span>Per-user encrypted security partition</span>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" isLoading={isSaving} size="md">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
