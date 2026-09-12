import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this data. Check your connection and try again.',
  error,
  onRetry,
  retryLabel = 'Try again',
  className,
}) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center text-center px-6 py-10', className)}
    >
      <span className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </span>
      <h3 className="text-headline font-semibold text-ink-900">{title}</h3>
      <p className="text-subhead text-ink-500 max-w-sm mt-1">{description}</p>
      {error && (
        <p className="mt-2 text-caption font-mono text-ink-400 max-w-md break-words">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry} className="mt-4">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
