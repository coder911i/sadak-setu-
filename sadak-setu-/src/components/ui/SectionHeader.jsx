import React from 'react';
import { cn } from '../../utils/cn';

// Page-level heading used by every route so screens share one rhythm.
export function PageHeader({ title, subtitle, icon: Icon, actions, className }) {
  return (
    <header className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0 flex items-start gap-3">
        {Icon && (
          <span className="hidden sm:flex w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-brand-600" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-title3 sm:text-title2 font-semibold text-ink-900">{title}</h1>
          {subtitle && <p className="text-footnote sm:text-subhead text-ink-500 mt-0.5 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">{actions}</div>}
    </header>
  );
}

// Smaller heading used between blocks inside a page.
export function SectionHeader({ title, subtitle, icon: Icon, action, className }) {
  return (
    <div className={cn('flex items-end justify-between gap-4 mb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-headline font-semibold text-ink-900 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-brand-600 flex-shrink-0" aria-hidden="true" />}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && <p className="text-footnote text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
