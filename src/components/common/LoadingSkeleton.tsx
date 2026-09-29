import React from 'react';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`p-6 rounded-2xl bg-card-dark/60 dark:bg-card-dark/60 light:bg-slate-100 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 animate-pulse ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-white/10 dark:bg-white/10 light:bg-slate-200 rounded w-28" />
      <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-white/10 light:bg-slate-200" />
    </div>
    <div className="h-8 bg-white/10 dark:bg-white/10 light:bg-slate-200 rounded w-44 mb-3" />
    <div className="h-3 bg-white/5 dark:bg-white/5 light:bg-slate-200 rounded w-20" />
  </div>
);

export const SkeletonRow: React.FC = () => (
  <div className="flex items-center justify-between p-4 border-b border-spendlyBorder-dark/50 dark:border-spendlyBorder-dark/50 light:border-slate-100 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-white/10 light:bg-slate-200" />
      <div className="space-y-1.5">
        <div className="h-4 bg-white/10 dark:bg-white/10 light:bg-slate-200 rounded w-32" />
        <div className="h-3 bg-white/5 dark:bg-white/5 light:bg-slate-200 rounded w-20" />
      </div>
    </div>
    <div className="space-y-1.5 text-right">
      <div className="h-4 bg-white/10 dark:bg-white/10 light:bg-slate-200 rounded w-24 ml-auto" />
      <div className="h-3 bg-white/5 dark:bg-white/5 light:bg-slate-200 rounded w-16 ml-auto" />
    </div>
  </div>
);

export const SkeletonChart: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div
    className={`p-6 rounded-2xl bg-card-dark/60 dark:bg-card-dark/60 light:bg-slate-100 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 animate-pulse flex flex-col justify-between ${height}`}
  >
    <div className="flex items-center justify-between">
      <div className="h-5 bg-white/10 dark:bg-white/10 light:bg-slate-200 rounded w-36" />
      <div className="h-7 bg-white/10 dark:bg-white/10 light:bg-slate-200 rounded w-40" />
    </div>
    <div className="w-full h-36 bg-white/5 dark:bg-white/5 light:bg-slate-200/60 rounded-xl flex items-end gap-3 px-4 pb-2">
      <div className="w-1/8 h-1/3 bg-white/10 rounded-t" />
      <div className="w-1/8 h-1/2 bg-white/10 rounded-t" />
      <div className="w-1/8 h-3/4 bg-white/10 rounded-t" />
      <div className="w-1/8 h-2/5 bg-white/10 rounded-t" />
      <div className="w-1/8 h-4/5 bg-white/10 rounded-t" />
      <div className="w-1/8 h-2/3 bg-white/10 rounded-t" />
      <div className="w-1/8 h-full bg-white/10 rounded-t" />
    </div>
  </div>
);
