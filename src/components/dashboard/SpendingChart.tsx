import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TimeRangeFilter } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { buildSpendingChartData } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';

export const SpendingChart: React.FC = () => {
  const [range, setRange] = useState<TimeRangeFilter>('30d');
  const { transactions } = useTransactions();
  const { profile } = useAuth();
  const currency = profile?.currency || 'NGN';

  const chartData = useMemo(() => {
    return buildSpendingChartData(transactions, range);
  }, [transactions, range]);

  const rangeButtons: { key: TimeRangeFilter; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '3m', label: '3M' },
    { key: '1y', label: '1Y' },
  ];

  // Custom sleek tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#151D32]/95 dark:bg-[#151D32]/95 light:bg-white/95 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <p className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900 mb-1.5">
            {dataPoint.displayDate || label}
          </p>
          <div className="flex items-center justify-between gap-4 text-financial-expense">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-financial-expense" />
              Expenses:
            </span>
            <span className="font-bold">{formatCurrency(dataPoint.spending, currency)}</span>
          </div>
          {dataPoint.income > 0 && (
            <div className="flex items-center justify-between gap-4 text-financial-income mt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-financial-income" />
                Income:
              </span>
              <span className="font-bold">{formatCurrency(dataPoint.income, currency)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      {/* Header with Title and Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary dark:text-text-primary light:text-slate-900">
            Spending Overview
          </h3>
          <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
            Dynamic expense trajectory across selected timeframe
          </p>
        </div>

        {/* Segmented Controls */}
        <div className="flex items-center self-start sm:self-auto bg-background-dark/60 dark:bg-background-dark/60 light:bg-slate-100 p-1 rounded-xl border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200">
          {rangeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setRange(btn.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150 ${
                range === btn.key
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.05)"
              className="dark:stroke-white/5 light:stroke-slate-200"
            />

            <XAxis
              dataKey="displayDate"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCurrency(val, currency, { compact: true })}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="spending"
              stroke="#F43F5E"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#spendingGradient)"
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
