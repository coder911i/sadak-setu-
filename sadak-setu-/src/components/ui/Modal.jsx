import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm:   'max-w-md',
    md:   'max-w-xl',
    lg:   'max-w-3xl',
    xl:   'max-w-5xl',
    full: 'max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div
        className={cn(
          'relative w-full bg-white border border-[#ddeae0] rounded-2xl shadow-elevated overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ddeae0] flex items-center justify-between gap-4 bg-surface-50">
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-base font-bold text-[#1a3825] truncate">{title}</h3>}
            {description && <p className="text-xs text-[#7a9a83] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#7a9a83] hover:text-[#1a3825] p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 text-[#1a3825]">{children}</div>

        {/* Optional footer */}
        {footer && (
          <div className="px-6 py-4 bg-surface-50 border-t border-[#ddeae0] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
