import React, { useId, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  type = 'text',
  className,
  containerClassName,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword && revealed ? 'text' : type;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-subhead font-medium text-ink-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <Icon className="w-4 h-4 text-ink-400 absolute left-3.5 pointer-events-none" aria-hidden="true" />
        )}
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'input-base',
            Icon && 'pl-10',
            isPassword && 'pr-11',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-500/15',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="absolute right-2 p-2 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-surface-100 transition-colors"
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-footnote text-red-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-footnote text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
