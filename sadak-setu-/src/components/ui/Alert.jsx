import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) {
  const variants = {
    info:    'bg-brand-50 border-brand-200 text-brand-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger:  'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const icons = {
    info:    <Info className="w-5 h-5 text-brand-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    danger:  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />,
  };

  const closeColors = {
    info:    'text-brand-500 hover:text-brand-800 hover:bg-brand-100',
    warning: 'text-amber-500 hover:text-amber-800 hover:bg-amber-100',
    danger:  'text-red-500 hover:text-red-800 hover:bg-red-100',
    success: 'text-green-500 hover:text-green-800 hover:bg-green-100',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-xs relative',
        variants[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-bold text-sm leading-tight mb-0.5">{title}</h5>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn('p-1 rounded-lg transition-colors', closeColors[variant])}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
