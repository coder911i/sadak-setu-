import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({
  children,
  className,
  variant = 'default',
  size = 'sm',
  dot = false,
  dotColor,
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full border transition-colors';

  const variants = {
    default:  'bg-surface-100 text-[#4a6b55] border-[#ddeae0]',
    primary:  'bg-brand-100 text-brand-700 border-brand-200',
    success:  'bg-green-100 text-green-700 border-green-200',
    warning:  'bg-amber-100 text-amber-700 border-amber-200',
    danger:   'bg-red-100 text-red-700 border-red-200',
    info:     'bg-blue-100 text-blue-700 border-blue-200',
    purple:   'bg-purple-100 text-purple-700 border-purple-200',
    orange:   'bg-orange-100 text-orange-700 border-orange-200',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  };

  const defaultDotColors = {
    default: 'bg-[#7a9a83]',
    primary: 'bg-brand-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger:  'bg-red-600',
    info:    'bg-blue-600',
    purple:  'bg-purple-600',
    orange:  'bg-orange-600',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse',
            dotColor || defaultDotColors[variant] || 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  );
}
