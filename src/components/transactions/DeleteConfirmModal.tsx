import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete this transaction?',
  message = 'This action cannot be undone. Are you sure you want to permanently remove this transaction from your records?',
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-financial-expense/10 border border-financial-expense/20 text-financial-expense">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs text-text-primary dark:text-text-primary light:text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm">
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={loading}
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
