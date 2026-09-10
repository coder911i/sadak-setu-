import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { BottomSheet } from '../ui/BottomSheet';
import { PRIMARY_NAV, SECONDARY_NAV, isNavActive } from './navigation';

// Native-app style tab bar shown on phones instead of a website navbar.
export function MobileTabBar() {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreActive = SECONDARY_NAV.some((item) => isNavActive(location.pathname, item.path));

  return (
    <>
      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-line shadow-nav pb-safe"
      >
        <ul className="grid grid-cols-5">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(location.pathname, item.path);

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 h-16 px-1 transition-colors press',
                    active ? 'text-brand-700' : 'text-ink-500'
                  )}
                >
                  <Icon
                    className={cn('w-[22px] h-[22px]', active && 'text-brand-600')}
                    strokeWidth={active ? 2.3 : 1.8}
                    aria-hidden="true"
                  />
                  <span className={cn('text-caption leading-none', active && 'font-semibold')}>{item.label}</span>
                </NavLink>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              className={cn(
                'w-full flex flex-col items-center justify-center gap-0.5 h-16 px-1 transition-colors press',
                moreActive ? 'text-brand-700' : 'text-ink-500'
              )}
              aria-haspopup="dialog"
              aria-expanded={isMoreOpen}
            >
              <MoreHorizontal className="w-[22px] h-[22px]" strokeWidth={moreActive ? 2.3 : 1.8} aria-hidden="true" />
              <span className={cn('text-caption leading-none', moreActive && 'font-semibold')}>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <BottomSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title="All modules">
        <ul className="grid grid-cols-2 gap-2.5 pb-2">
          {SECONDARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(location.pathname, item.path);

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    'flex flex-col gap-2 p-4 rounded-2xl border transition-colors press h-full',
                    active
                      ? 'bg-brand-50 border-brand-200 text-brand-800'
                      : 'bg-white border-line text-ink-700 hover:bg-surface-50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', active ? 'text-brand-600' : 'text-ink-400')} aria-hidden="true" />
                  <span className="text-subhead font-medium">{item.longLabel}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
