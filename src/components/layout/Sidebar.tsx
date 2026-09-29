import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  onOpenAddModal,
}) => {
  const { user, profile, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('You have been signed out.', 'info');
      navigate('/login');
    } catch {
      showToast('Error signing out. Please try again.', 'error');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'AI Advisor', path: '/ai-advisor', icon: Sparkles, badge: 'AI' },
    { name: 'Profile & Settings', path: '/profile', icon: UserCheck },
  ];

  const displayName = profile?.displayName || user?.displayName || 'User';
  const email = profile?.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`hidden md:flex flex-col justify-between shrink-0 bg-background-secondary/90 dark:bg-background-secondary/90 light:bg-white border-r border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 transition-all duration-300 z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand & Collapse Button */}
      <div className="p-4 flex items-center justify-between border-b border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-primary to-financial-income flex items-center justify-center p-0.5 shadow-glow-primary shrink-0">
              <div className="w-full h-full bg-[#11182B] dark:bg-[#11182B] light:bg-white rounded-[10px] flex items-center justify-center">
                <span className="text-accent-primary font-bold text-sm leading-none">S</span>
              </div>
            </div>
            <span className="font-bold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight text-base truncate">
              Spendly
            </span>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-primary to-financial-income flex items-center justify-center p-0.5 shadow-glow-primary">
            <div className="w-full h-full bg-[#11182B] dark:bg-[#11182B] light:bg-white rounded-[10px] flex items-center justify-center">
              <span className="text-accent-primary font-bold text-sm leading-none">S</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={onOpenAddModal}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-glow-primary transition-all duration-200 active:scale-95 ${
            isCollapsed ? 'px-0' : 'px-3'
          }`}
          title="Add Transaction"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Add Transaction</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-accent-primary/15 text-accent-primary dark:text-accent-primary light:text-accent-primary font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-primary rounded-r-full" />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile and Sign Out */}
      <div className="p-3 border-t border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 space-y-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-card-dark/50 dark:bg-card-dark/50 light:bg-slate-50 border border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-primary to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {initials || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-text-primary dark:text-text-primary light:text-slate-900 truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-text-secondary truncate">{email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-primary to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs">
              {initials || 'U'}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:text-financial-expense hover:bg-financial-expense/10 rounded-xl transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
