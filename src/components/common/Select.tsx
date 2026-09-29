import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-text-secondary dark:text-text-secondary light:text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-xl bg-card-dark dark:bg-card-dark light:bg-white text-text-primary dark:text-text-primary light:text-slate-900 border appearance-none pr-10 pl-3.5 py-2.5 min-h-[44px] text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary cursor-pointer ${
              error
                ? 'border-financial-expense focus:border-financial-expense focus:ring-financial-expense/20'
                : 'border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 focus:border-accent-primary'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-card-dark text-text-primary dark:bg-card-dark dark:text-text-primary light:bg-white light:text-slate-900 py-1"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 flex items-center pointer-events-none text-text-secondary">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && <p className="mt-1.5 text-xs text-financial-expense">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
