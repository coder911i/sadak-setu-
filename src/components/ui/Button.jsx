import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants = {
    primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow focus:ring-brand-500 border border-brand-600',
    secondary: 'bg-white hover:bg-surface-50 text-[#1a3825] border border-[#ddeae0] hover:border-brand-300 focus:ring-brand-300 shadow-sm',
    outline:   'bg-transparent hover:bg-brand-50 text-brand-700 hover:text-brand-800 border border-brand-300 focus:ring-brand-300',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 border border-red-600',
    warning:   'bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:ring-amber-400 border border-amber-500',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500 border border-emerald-600',
    ghost:     'bg-transparent hover:bg-surface-100 text-[#4a6b55] hover:text-brand-700 focus:ring-brand-300',
    accent:    'bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:ring-amber-400 border border-amber-500',
    muted:     'bg-surface-100 hover:bg-surface-200 text-[#4a6b55] border border-[#ddeae0] focus:ring-brand-300',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1.5 gap-1.5',
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm px-5 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}
