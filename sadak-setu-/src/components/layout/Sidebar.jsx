import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useRoads } from '../../hooks/useRoads';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, isNavActive } from './navigation';
import { ChevronLeft, ChevronRight, LogOut, X, ScanLine } from 'lucide-react';

const initialsOf = (name) =>
  (name || 'Sadak Setu')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { stats } = useRoads();
  const { info } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [hoveredItem, setHoveredItem] = useState(null);

  const badges = {
    roads: stats.totalCorridors ? String(stats.totalCorridors) : null,
    inspections: stats.criticalDefects ? `${stats.criticalDefects}` : null,
  };

  const badgeTone = {
    inspections: 'bg-red-50 text-red-700 border-red-200',
  };

  const expanded = !isCollapsed || isMobileOpen;

  const handleNavClick = () => {
    if (isMobileOpen) onCloseMobile();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      info('Signed out', 'Your Sadak Setu session has ended.');
      navigate('/login');
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-[2px] md:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed md:sticky md:top-0 inset-y-0 left-0 md:h-[100dvh] z-50 flex flex-col border-r border-line bg-white select-none',
          'transition-[width,transform] duration-300 ease-ios',
          isMobileOpen ? 'translate-x-0 w-[17rem] shadow-elevated' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-[15.5rem]'
        )}
      >
        {/* Brand */}
        <div className="h-14 px-3 flex items-center justify-between gap-2 border-b border-line flex-shrink-0">
          <NavLink to="/" onClick={handleNavClick} className="flex items-center gap-2.5 min-w-0 group rounded-xl p-1">
            <span className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:bg-brand-700 transition-colors">
              <img src="/logo.svg" alt="" className="w-full h-full object-contain brightness-0 invert" />
            </span>
            {expanded && (
              <span className="min-w-0">
                <span className="block text-subhead font-semibold tracking-tight text-ink-900 truncate">
                  Sadak Setu
                </span>
                <span className="block text-caption text-ink-400 truncate">Road intelligence</span>
              </span>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex p-1.5 rounded-lg text-ink-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 rounded-lg text-ink-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary action */}
        <div className="p-3">
          <button
            onClick={() => {
              navigate('/inspections');
              handleNavClick();
            }}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white',
              'font-semibold shadow-sm transition-colors press min-h-[40px]',
              expanded ? 'px-3 text-subhead' : 'px-0'
            )}
            title="Start road scan"
          >
            <ScanLine className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {expanded && <span>New inspection</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(location.pathname, item.path);
            const badge = badges[item.id];

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 min-h-[40px] text-subhead transition-colors',
                    active
                      ? 'bg-brand-50 text-brand-800 font-semibold'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-surface-50 font-medium',
                    !expanded && 'justify-center px-0'
                  )}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-brand-600" />}
                  <Icon
                    className={cn('w-[18px] h-[18px] flex-shrink-0', active ? 'text-brand-600' : 'text-ink-400')}
                    aria-hidden="true"
                  />
                  {expanded && (
                    <span className="flex items-center justify-between gap-2 flex-1 min-w-0">
                      <span className="truncate">{item.longLabel}</span>
                      {badge && (
                        <span
                          className={cn(
                            'text-caption font-semibold px-1.5 py-0.5 rounded-full border',
                            badgeTone[item.id] || 'bg-surface-100 text-ink-600 border-line'
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>

                {!expanded && hoveredItem === item.id && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-xl bg-ink-900 text-white text-footnote shadow-elevated whitespace-nowrap z-50 pointer-events-none">
                    {item.longLabel}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Account */}
        <div className="p-3 border-t border-line flex items-center gap-2.5">
          <span className="relative flex-shrink-0">
            <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-semibold text-footnote">
              {initialsOf(user?.fullName)}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </span>

          {expanded && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-footnote font-semibold text-ink-900 truncate">
                  {user?.fullName || 'Signed in'}
                </span>
                <span className="block text-caption text-ink-400 truncate">
                  {user?.role ? user.role.replace(/_/g, ' ') : 'Sadak Setu'}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
