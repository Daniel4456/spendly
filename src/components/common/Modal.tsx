import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 z-10 animate-slide-up max-h-[92vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-100 mb-4">
          <div>
            <h3
              id="modal-title"
              className="text-lg font-semibold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight"
            >
              {title}
            </h3>
            {description && (
              <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary dark:hover:text-text-primary light:hover:text-slate-900 rounded-lg transition-colors hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};
