import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] min-h-[44px]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyles = {
    primary:
      'bg-accent-primary hover:bg-accent-primary-hover text-white shadow-glow-primary focus:ring-accent-primary focus:ring-offset-background-dark dark:focus:ring-offset-background-dark',
    secondary:
      'bg-card-elevated hover:bg-[#232F52] dark:bg-card-elevated dark:hover:bg-[#232F52] text-text-primary border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-800 light:border-slate-300 focus:ring-accent-primary',
    danger:
      'bg-financial-expense/15 hover:bg-financial-expense/25 text-financial-expense border border-financial-expense/30 focus:ring-financial-expense',
    outline:
      'border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-text-primary dark:text-text-primary light:text-slate-700 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 focus:ring-accent-primary',
    ghost:
      'text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 focus:ring-accent-primary',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
