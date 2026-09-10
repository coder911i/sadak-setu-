import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

// Mobile-first detail panel. Slides up from the bottom on phones and renders as
// a centred dialog from `sm` upwards.
export function BottomSheet({ isOpen, onClose, title, description, children, footer, className }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Details'}
        className={cn(
          'relative w-full sm:max-w-lg bg-white shadow-sheet border border-line',
          'rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col',
          'animate-sheet-up sm:animate-scale-in',
          className
        )}
      >
        {/* Grab handle (touch affordance) */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-surface-300" />
        </div>

        {(title || description) && (
          <div className="px-5 pt-3 pb-4 flex items-start justify-between gap-4 border-b border-line flex-shrink-0">
            <div className="min-w-0">
              {title && <h2 className="text-headline font-semibold text-ink-900 truncate">{title}</h2>}
              {description && <p className="text-footnote text-ink-500 mt-0.5">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-1 rounded-xl text-ink-400 hover:text-ink-900 hover:bg-surface-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-line bg-surface-50 rounded-b-3xl pb-safe flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
