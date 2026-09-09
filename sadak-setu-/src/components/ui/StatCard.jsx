import React from 'react';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  iconBg = 'bg-brand-100 text-brand-600 border-brand-200',
  trend,
  trendDirection = 'neutral',
  trendLabel,
  subtext,
  badge,
  progress,
  accentColor,
  className,
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-[#ddeae0] p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      {/* Optional top accent bar */}
      {accentColor && (
        <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-2xl', accentColor)} />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#7a9a83] uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5 pt-1">
            <h4 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a3825] font-mono">
              {value}
            </h4>
            {unit && <span className="text-xs font-medium text-[#7a9a83]">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={cn('p-2.5 rounded-xl border flex-shrink-0 flex items-center justify-center', iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Optional Progress Bar */}
      {progress !== undefined && (
        <div className="mt-4 space-y-1.5">
          <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progress >= 80 ? 'bg-brand-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer / Trend line */}
      <div className="mt-3.5 flex items-center justify-between text-xs pt-1 border-t border-[#ddeae0]">
        {trend && (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold text-[11px] px-1.5 py-0.5 rounded-lg',
                trendDirection === 'up'      && 'text-green-700 bg-green-100',
                trendDirection === 'down'    && 'text-red-700 bg-red-100',
                trendDirection === 'neutral' && 'text-[#4a6b55] bg-surface-100'
              )}
            >
              {trendDirection === 'up'      && <TrendingUp className="w-3 h-3" />}
              {trendDirection === 'down'    && <TrendingDown className="w-3 h-3" />}
              {trendDirection === 'neutral' && <Minus className="w-3 h-3" />}
              {trend}
            </span>
            {trendLabel && <span className="text-[#7a9a83] text-[11px] truncate">{trendLabel}</span>}
          </div>
        )}

        {subtext && !trend && <span className="text-[#7a9a83] text-[11px] truncate">{subtext}</span>}

        {badge && <div className="ml-auto">{badge}</div>}
      </div>
    </div>
  );
}
