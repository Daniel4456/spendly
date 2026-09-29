import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

interface NavbarProps {
  onOpenAddModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { user, profile, signOut, isFirebase } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('You have been signed out.', 'info');
      navigate('/login');
    } catch {
      showToast('Error signing out. Please try again.', 'error');
    }
  };

  const displayName = profile?.displayName || user?.displayName || 'User';
  const email = profile?.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full bg-background-dark/80 dark:bg-background-dark/80 light:bg-white/80 backdrop-blur-md border-b border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-financial-income flex items-center justify-center p-0.5 shadow-glow-primary group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#11182B] dark:bg-[#11182B] light:bg-white rounded-[10px] flex items-center justify-center">
                <span className="text-accent-primary font-bold text-lg leading-none">S</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
                Spendly
              </span>
              <span className="text-[10px] text-text-secondary dark:text-text-secondary light:text-slate-500 hidden sm:inline -mt-1 font-medium">
                Take control of your money
              </span>
            </div>
          </Link>

          {!isFirebase && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-financial-info/10 text-financial-info border border-financial-info/20 ml-2">
              Preview Mode
            </span>
          )}
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Button (Desktop only, mobile has bottom bar) */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-glow-primary transition-all duration-200 active:scale-95"
            >
              <span>+ Add Transaction</span>
            </button>
          )}

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
              aria-label="Toggle theme menu"
            >
              {resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 rounded-xl shadow-xl py-1 text-xs z-50 animate-slide-up">
                <button
                  onClick={() => {
                    setTheme('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 ${
                    theme === 'dark' ? 'text-accent-primary font-semibold' : 'text-text-secondary'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button
                  onClick={() => {
                    setTheme('light');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 ${
                    theme === 'light' ? 'text-accent-primary font-semibold' : 'text-text-secondary'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 ${
                    theme === 'system' ? 'text-accent-primary font-semibold' : 'text-text-secondary'
                  }`}
                >
                  <Monitor className="w-4 h-4" /> System
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowThemeMenu(false);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-primary ring-2 ring-background-dark dark:ring-background-dark light:ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-spendlyBorder-dark/50 dark:border-spendlyBorder-dark/50 light:border-slate-100">
                  <span className="text-xs font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
                    Notifications
                  </span>
                  <span className="text-[10px] text-accent-primary font-medium">All caught up</span>
                </div>
                <div className="py-3 text-xs space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-50">
                    <Sparkles className="w-4 h-4 text-financial-income shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-text-primary dark:text-text-primary light:text-slate-900">
                        Welcome to Spendly!
                      </p>
                      <p className="text-[11px] text-text-secondary dark:text-text-secondary light:text-slate-500">
                        Start tracking your daily expenses and income effortlessly.
                      </p>
                    </div>
                  </div>
                  {profile?.currency && (
                    <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-50 text-[11px] text-text-secondary">
                      Active Currency: <strong className="text-text-primary dark:text-text-primary light:text-slate-900">{profile.currency}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowThemeMenu(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-primary to-[#8B5CF6] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                {initials || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden sm:inline" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-slide-up">
                <div className="px-4 py-2 border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100">
                  <p className="text-xs font-semibold text-text-primary dark:text-text-primary light:text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate mt-0.5">{email}</p>
                </div>

                <div className="py-1 text-xs">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile & Currency
                  </Link>
                  <Link
                    to="/budgets"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-50 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" /> Manage Budgets
                  </Link>
                </div>

                <div className="border-t border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-financial-expense hover:bg-financial-expense/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
