import React from 'react';
import { cn } from '../../utils/cn';

export function Tabs({ tabs, activeTab, onChange, className, variant = 'pills' }) {
  if (variant === 'underline') {
    return (
      <div className={cn('flex items-center gap-1 border-b border-line', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer select-none -mb-px',
                isActive
                  ? 'border-brand-600 text-brand-700 font-bold'
                  : 'border-transparent text-ink-400 hover:text-ink-900 hover:border-[#b5ccbc]'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-mono',
                    isActive
                      ? 'bg-brand-100 text-brand-700 border border-brand-200'
                      : 'bg-surface-100 text-ink-400 border border-line'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pills variant
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-surface-100 rounded-xl border border-line', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none',
              isActive
                ? 'bg-brand-600 text-white shadow-sm font-semibold'
                : 'text-ink-600 hover:text-brand-700 hover:bg-white'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold',
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-surface-200 text-ink-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
