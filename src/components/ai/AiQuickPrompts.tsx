import React from 'react';
import { Sparkles, PieChart, TrendingDown, ShieldAlert, Zap, PiggyBank, HelpCircle } from 'lucide-react';
import { QuickPrompt } from '../../types/ai';

interface AiQuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'audit',
    title: 'Analyze Spending',
    prompt: 'Analyze my spending and show me where my money is going',
    iconName: 'PieChart',
    badge: 'Popular',
  },
  {
    id: 'overspending',
    title: 'Where am I overspending?',
    prompt: 'Where am I overspending and what is my biggest expense?',
    iconName: 'ShieldAlert',
  },
  {
    id: 'save',
    title: 'How to save more?',
    prompt: 'How can I save more money this month based on my records?',
    iconName: 'PiggyBank',
  },
  {
    id: 'budget_check',
    title: 'Check Budgets',
    prompt: 'Check all my monthly budgets and tell me if I am over limit',
    iconName: 'TrendingDown',
  },
  {
    id: 'quick_log',
    title: 'Log Lunch: ₦3,500',
    prompt: 'Spent ₦3,500 on lunch today',
    iconName: 'Zap',
    badge: 'Fast',
  },
  {
    id: 'forecast',
    title: 'Month-End Forecast',
    prompt: 'Predict my end of month balance based on my current spending speed',
    iconName: 'Sparkles',
  },
];

export const AiQuickPrompts: React.FC<AiQuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PieChart':
        return <PieChart className="w-3.5 h-3.5 text-accent-primary" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-3.5 h-3.5 text-financial-expense" />;
      case 'PiggyBank':
        return <PiggyBank className="w-3.5 h-3.5 text-financial-income" />;
      case 'TrendingDown':
        return <TrendingDown className="w-3.5 h-3.5 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-accent-primary" />;
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-text-secondary px-1">
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-accent-primary" /> Suggested Questions & Actions
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
        {QUICK_PROMPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card-dark/80 dark:bg-card-dark/80 light:bg-slate-100 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200 border border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-300 text-text-primary dark:text-text-primary light:text-slate-800 text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 disabled:opacity-50 shrink-0"
          >
            {getIcon(item.iconName)}
            <span>{item.title}</span>
            {item.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-accent-primary/20 text-accent-primary">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
