import React from 'react';
import { getPCIRating } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export function HealthScoreBadge({ score = 0, size = 'md', showBar = false, className }) {
  const meta = getPCIRating(score);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'rounded-lg font-mono font-bold border transition-colors inline-flex items-center gap-1',
            meta.badgeClass,
            sizeClasses[size]
          )}
        >
          <span>{score}</span>
          <span className="text-[10px] opacity-75">/ 100</span>
        </span>
        <span className="text-[10px] font-medium text-slate-400 font-mono">
          {meta.grade} Grade
        </span>
      </div>

      {showBar && (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-500', meta.barColor)}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}
    </div>
  );
}
