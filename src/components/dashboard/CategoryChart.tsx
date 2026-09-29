import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { getCategoryMeta } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';
import { PieChart as PieIcon } from 'lucide-react';

export const CategoryChart: React.FC = () => {
  const { categoryExpenses, totalExpenses } = useTransactions();
  const { profile } = useAuth();
  const currency = profile?.currency || 'NGN';

  const chartData = useMemo(() => {
    const list = Object.entries(categoryExpenses).map(([category, amount]) => {
      const meta = getCategoryMeta(category);
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      return {
        name: category,
        value: amount,
        percentage,
        color: meta.chartColor,
        icon: meta.icon,
      };
    });

    return list.sort((a, b) => b.value - a.value);
  }, [categoryExpenses, totalExpenses]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#151D32]/95 dark:bg-[#151D32]/95 light:bg-white/95 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
              {data.name}
            </span>
          </div>
          <div className="text-text-secondary dark:text-text-secondary light:text-slate-600">
            {formatCurrency(data.value, currency)} ({data.percentage.toFixed(1)}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between min-w-0">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-text-primary dark:text-text-primary light:text-slate-900">
          Where Your Money Goes
        </h3>
        <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-0.5">
          Breakdown by expense category
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-56 sm:h-72 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 dark:bg-white/5 light:bg-slate-100 flex items-center justify-center text-text-secondary mb-3">
            <PieIcon className="w-6 h-6" />
          </div>
          <p className="text-xs text-text-secondary">No expense transactions recorded yet.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-6 min-w-0 w-full">
          {/* Donut Chart */}
          <div className="w-full sm:w-56 h-48 sm:h-56 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-semibold text-text-secondary">Total</span>
              <span className="text-sm font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                {formatCurrency(totalExpenses, currency, { compact: true })}
              </span>
            </div>
          </div>

          {/* Harmonious Legend List */}
          <div className="w-full flex-1 max-h-56 overflow-y-auto space-y-2 pr-1">
            {chartData.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 dark:bg-white/5 light:bg-slate-50 hover:bg-white/10 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    <span className="font-medium text-text-primary dark:text-text-primary light:text-slate-800 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
                      {formatCurrency(item.value, currency)}
                    </span>
                    <span className="text-[11px] text-text-secondary w-10 text-right font-medium">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
