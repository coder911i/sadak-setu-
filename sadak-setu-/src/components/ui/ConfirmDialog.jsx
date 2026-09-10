import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

// Confirmation gate for destructive or irreversible actions.
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={
            variant === 'danger'
              ? 'w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0'
              : 'w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0'
          }
        >
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </span>
        <p className="text-subhead text-ink-600 leading-relaxed">{description}</p>
      </div>
    </Modal>
  );
}
