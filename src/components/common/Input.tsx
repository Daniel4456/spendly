import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isPassword = false,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-text-secondary dark:text-text-secondary light:text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-text-secondary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`w-full rounded-xl bg-card-dark dark:bg-card-dark light:bg-white text-text-primary dark:text-text-primary light:text-slate-900 border transition-all duration-200 placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm py-2.5 min-h-[44px] ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${isPassword || rightIcon ? 'pr-11' : 'pr-3.5'} ${
              error
                ? 'border-financial-expense focus:border-financial-expense focus:ring-financial-expense/20'
                : 'border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 focus:border-accent-primary'
            } ${className}`}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-text-secondary hover:text-text-primary transition-colors p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-accent-primary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center pointer-events-none text-text-secondary">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-financial-expense flex items-center gap-1">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
