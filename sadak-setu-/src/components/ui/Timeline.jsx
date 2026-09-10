import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const STATE_STYLES = {
  done:    { dot: 'bg-brand-600 border-brand-600 text-white', line: 'bg-brand-200', label: 'text-ink-900' },
  current: { dot: 'bg-white border-brand-500 text-brand-600 ring-4 ring-brand-500/15', line: 'bg-surface-200', label: 'text-ink-900' },
  pending: { dot: 'bg-white border-line-strong text-ink-400', line: 'bg-surface-200', label: 'text-ink-500' },
  failed:  { dot: 'bg-red-600 border-red-600 text-white', line: 'bg-surface-200', label: 'text-red-700' },
};

/**
 * Vertical process timeline.
 * items: [{ id, title, description, timestamp, state, icon, meta }]
 */
export function Timeline({ items = [], className }) {
  return (
    <ol className={cn('relative', className)}>
      {items.map((item, index) => {
        const styles = STATE_STYLES[item.state] || STATE_STYLES.pending;
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <li key={item.id ?? index} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                className={cn('absolute left-[13px] top-7 bottom-0 w-0.5 rounded-full', styles.line)}
                aria-hidden="true"
              />
            )}

            <span
              className={cn(
                'relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                styles.dot
              )}
              aria-hidden="true"
            >
              {Icon ? (
                <Icon className="w-3.5 h-3.5" />
              ) : item.state === 'done' ? (
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn('text-subhead font-semibold', styles.label)}>{item.title}</p>
                {item.timestamp && (
                  <time className="text-caption text-ink-400 font-mono flex-shrink-0">{item.timestamp}</time>
                )}
              </div>
              {item.description && <p className="text-footnote text-ink-500 mt-0.5">{item.description}</p>}
              {item.meta && <div className="mt-1.5">{item.meta}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
