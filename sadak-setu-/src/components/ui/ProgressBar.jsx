import React from 'react';
import { cn } from '../../utils/cn';

export function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  label,
  size = 'md',
  color = 'brand',
  className,
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    pci: percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs text-ink-700">
          <span>{label}</span>
          <span className="font-mono font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-100 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color] || colors.brand)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
