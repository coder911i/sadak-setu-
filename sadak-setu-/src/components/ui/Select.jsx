import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Select({
  label,
  hint,
  error,
  options = [],
  children,
  className,
  containerClassName,
  id,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-subhead font-medium text-ink-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'input-base appearance-none pr-10 cursor-pointer',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-500/15',
            className
          )}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-ink-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-footnote text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-footnote text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
