import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ children, className, variant = 'default', hover = false, ...props }) {
  const variants = {
    default:   'bg-white border-[#ddeae0] shadow-card',
    elevated:  'bg-white border-[#ddeae0] shadow-elevated',
    command:   'bg-white border-[#ddeae0] shadow-card backdrop-blur-md',
    lightCard: 'bg-white border-[#ddeae0] shadow-card',
    highlight: 'bg-gradient-to-b from-brand-50 to-white border-brand-200 shadow-card',
    green:     'bg-brand-50 border-brand-200',
    muted:     'bg-surface-50 border-[#ddeae0]',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        variants[variant] || variants.default,
        hover && 'hover:shadow-card-hover hover:border-brand-200 cursor-pointer hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action, ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-b border-[#ddeae0] flex items-center justify-between gap-4',
        className
      )}
      {...props}
    >
      <div className="space-y-0.5 flex-1 min-w-0">{children}</div>
      {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className, icon: Icon, ...props }) {
  return (
    <h3
      className={cn('text-sm font-bold text-[#1a3825] tracking-tight flex items-center gap-2', className)}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-brand-600 flex-shrink-0" />}
      <span>{children}</span>
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-xs text-[#7a9a83] leading-normal', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-3.5 bg-surface-50 border-t border-[#ddeae0] rounded-b-2xl flex items-center justify-between gap-3 text-xs text-[#7a9a83]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
