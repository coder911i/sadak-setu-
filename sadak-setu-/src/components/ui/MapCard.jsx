import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Consistent container for every Leaflet map in the app: rounded surface,
 * optional floating header/controls and a responsive height.
 */
export function MapCard({
  title,
  subtitle,
  controls,
  legend,
  footer,
  height = 'h-[320px] sm:h-[420px] lg:h-[500px]',
  className,
  children,
}) {
  return (
    <section className={cn('card-base overflow-hidden', className)}>
      {(title || controls) && (
        <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 border-b border-line">
          <div className="min-w-0">
            {title && <h2 className="text-headline font-semibold text-ink-900 truncate">{title}</h2>}
            {subtitle && <p className="text-footnote text-ink-500 truncate">{subtitle}</p>}
          </div>
          {controls && <div className="flex items-center gap-1.5 flex-shrink-0">{controls}</div>}
        </div>
      )}

      <div className={cn('relative w-full', height)}>
        {children}
        {legend && (
          <div className="absolute bottom-3 left-3 z-[400] rounded-xl bg-white/95 backdrop-blur border border-line shadow-card px-3 py-2">
            {legend}
          </div>
        )}
      </div>

      {footer && <div className="px-4 sm:px-5 py-3 border-t border-line bg-surface-50">{footer}</div>}
    </section>
  );
}

export function MapLegend({ items = [] }) {
  return (
    <ul className="flex items-center gap-3 text-caption text-ink-600">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
