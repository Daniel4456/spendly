import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  PieChart,
  UserCheck,
} from 'lucide-react';

interface MobileNavigationProps {
  onOpenAddModal: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onOpenAddModal }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card-dark/95 dark:bg-card-dark/95 light:bg-white/95 backdrop-blur-lg border-t border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] transition-colors duration-200"
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Home / Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-accent-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </NavLink>

        {/* Transactions */}
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-accent-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900'
            }`
          }
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] mt-1">History</span>
        </NavLink>

        {/* Prominent Floating ADD Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-13 h-13 sm:w-14 sm:h-14 p-3 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover text-white flex items-center justify-center shadow-lg shadow-accent-primary/40 ring-4 ring-background-dark dark:ring-background-dark light:ring-white active:scale-90 transition-transform duration-150"
            aria-label="Add transaction"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Budgets */}
        <NavLink
          to="/budgets"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-accent-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900'
            }`
          }
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-1">Budgets</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-accent-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900'
            }`
          }
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] mt-1">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
