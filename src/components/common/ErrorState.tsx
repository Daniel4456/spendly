import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong.',
  message = "We couldn't load your financial data right now. Please try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl bg-card-dark/40 dark:bg-card-dark/40 light:bg-slate-50 border border-financial-expense/20">
      <div className="w-12 h-12 rounded-2xl bg-financial-expense/10 border border-financial-expense/30 flex items-center justify-center text-financial-expense mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-text-primary dark:text-text-primary light:text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary light:text-slate-500 max-w-sm mb-5">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RotateCcw className="w-4 h-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
};
