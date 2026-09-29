import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastNotification['type'], title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastNotification['type'] = 'info', title?: string) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastNotification = { id, message, type, title };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast Render Container */}
      <div
        className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 animate-slide-up ${
                isSuccess
                  ? 'bg-[#151D32]/95 border-financial-income/40 text-text-primary dark:text-text-primary'
                  : isError
                  ? 'bg-[#151D32]/95 border-financial-expense/40 text-text-primary dark:text-text-primary'
                  : isWarning
                  ? 'bg-[#151D32]/95 border-financial-warning/40 text-text-primary dark:text-text-primary'
                  : 'bg-[#151D32]/95 border-financial-info/40 text-text-primary dark:text-text-primary'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-financial-income" />}
                {isError && <AlertCircle className="w-5 h-5 text-financial-expense" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-financial-warning" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-financial-info" />}
              </div>

              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
                <div className="text-text-secondary leading-snug">{toast.message}</div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-text-secondary hover:text-text-primary p-1 rounded-lg transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
