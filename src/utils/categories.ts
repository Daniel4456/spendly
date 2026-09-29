import React from 'react';
import {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Home,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Gift,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { ExpenseCategory, IncomeCategory } from '../types';

export interface CategoryMeta {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  chartColor: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Rent',
  'Other',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other',
];

export const CATEGORY_META: Record<string, CategoryMeta> = {
  // Expenses
  Food: {
    name: 'Food',
    icon: Utensils,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    chartColor: '#F59E0B',
  },
  Transport: {
    name: 'Transport',
    icon: Car,
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    chartColor: '#38BDF8',
  },
  Bills: {
    name: 'Bills',
    icon: Receipt,
    color: '#818CF8',
    bgColor: 'rgba(129, 140, 248, 0.15)',
    chartColor: '#818CF8',
  },
  Shopping: {
    name: 'Shopping',
    icon: ShoppingBag,
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    chartColor: '#EC4899',
  },
  Entertainment: {
    name: 'Entertainment',
    icon: Film,
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    chartColor: '#A855F7',
  },
  Health: {
    name: 'Health',
    icon: HeartPulse,
    color: '#F43F5E',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    chartColor: '#F43F5E',
  },
  Education: {
    name: 'Education',
    icon: GraduationCap,
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    chartColor: '#06B6D4',
  },
  Rent: {
    name: 'Rent',
    icon: Home,
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    chartColor: '#14B8A6',
  },
  Other: {
    name: 'Other',
    icon: MoreHorizontal,
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    chartColor: '#94A3B8',
  },

  // Incomes
  Salary: {
    name: 'Salary',
    icon: Briefcase,
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    chartColor: '#22C55E',
  },
  Freelance: {
    name: 'Freelance',
    icon: Laptop,
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    chartColor: '#6366F1',
  },
  Business: {
    name: 'Business',
    icon: Building2,
    color: '#0284C7',
    bgColor: 'rgba(2, 132, 199, 0.15)',
    chartColor: '#0284C7',
  },
  Investment: {
    name: 'Investment',
    icon: TrendingUp,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    chartColor: '#8B5CF6',
  },
  Gift: {
    name: 'Gift',
    icon: Gift,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    chartColor: '#F59E0B',
  },
};

export function getCategoryMeta(categoryName: string): CategoryMeta {
  return (
    CATEGORY_META[categoryName] || {
      name: categoryName || 'Other',
      icon: HelpCircle,
      color: '#94A3B8',
      bgColor: 'rgba(148, 163, 184, 0.15)',
      chartColor: '#94A3B8',
    }
  );
}
