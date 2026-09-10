import React from 'react';
import { cn } from '../../utils/cn';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

export function PriorityBadge({ priority = 'Monitor', size = 'sm', className }) {
  const normalized = priority?.toLowerCase();

  const configs = {
    immediate: {
      label: 'Immediate',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800',
      dotClass: 'bg-rose-500 animate-pulse',
      icon: AlertOctagon,
    },
    high: {
      label: 'High',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-800',
      dotClass: 'bg-orange-500',
      icon: AlertTriangle,
    },
    monitor: {
      label: 'Monitor',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
      dotClass: 'bg-emerald-500',
      icon: ShieldCheck,
    },
  };

  const config = configs[normalized] || configs.monitor;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.2 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border uppercase tracking-wider font-mono select-none',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dotClass)} />
      <span>{config.label}</span>
    </span>
  );
}
