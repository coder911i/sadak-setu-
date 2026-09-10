import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRoads } from '../../hooks/useRoads';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { ROAD_DIVISIONS } from '../../utils/constants';
import { routeMetaFor } from './navigation';
import { cn } from '../../utils/cn';
import {
  Menu,
  Bell,
  Search,
  User,
  Shield,
  LogOut,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Critical pothole detected',
    desc: 'NH-48 Km 62+400 — 9.5 cm depth',
    time: '12m ago',
    urgent: true,
  },
  {
    id: 2,
    title: 'Work order completed',
    desc: 'WO-2026-0884 (NH-44 Palwal) moved to audit queue',
    time: '45m ago',
    urgent: false,
  },
  {
    id: 3,
    title: 'Drone scan synced',
    desc: 'Point cloud updated for NE-1 Expressway',
    time: '2h ago',
    urgent: false,
  },
];

const initialsOf = (name) =>
  (name || 'Sadak Setu')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function Header({ onOpenSearch, onToggleMobileSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedZone, setSelectedZone } = useRoads();
  const { info } = useToast();
  const { user, logout } = useAuth();

  const [openMenu, setOpenMenu] = useState(null); // 'notifications' | 'profile'
  const [unreadCount, setUnreadCount] = useState(NOTIFICATIONS.length);
  const menuRef = useRef(null);

  const meta = routeMetaFor(location.pathname);

  useEffect(() => {
    if (!openMenu) return undefined;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  const handleLogout = async () => {
    setOpenMenu(null);
    try {
      await logout();
      info('Signed out', 'Your Sadak Setu session has ended.');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-xl border-b border-line pt-safe">
      <div className="h-14 px-3 sm:px-5 flex items-center justify-between gap-3" ref={menuRef}>
        {/* Left: menu + page title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-1 rounded-xl text-ink-600 hover:bg-surface-100 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-headline font-semibold text-ink-900 tracking-tight truncate">{meta.title}</h1>
            <p className="hidden sm:block text-caption text-ink-400 truncate">{meta.subtitle}</p>
          </div>
        </div>

        {/* Right: zone, search, notifications, profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <label className="hidden xl:flex items-center gap-1.5 rounded-xl border border-line bg-surface-50 px-2.5 h-9 text-footnote">
            <span className="text-ink-400">Zone</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent font-medium text-ink-900 focus:outline-none cursor-pointer max-w-[10rem] truncate"
              aria-label="Regional zone"
            >
              {ROAD_DIVISIONS.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-ink-400" aria-hidden="true" />
          </label>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl border border-line bg-surface-50 text-footnote text-ink-500 hover:text-ink-900 hover:border-line-strong transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-ink-400" aria-hidden="true" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-caption font-mono bg-white text-ink-400 border border-line rounded-md">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setOpenMenu(openMenu === 'notifications' ? null : 'notifications');
                setUnreadCount(0);
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-line bg-surface-50 text-ink-600 hover:text-ink-900 transition-colors"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={openMenu === 'notifications'}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-caption font-semibold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {openMenu === 'notifications' && (
              <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-1.5rem))] bg-white border border-line rounded-2xl shadow-elevated overflow-hidden animate-scale-in z-50">
                <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-surface-50">
                  <h2 className="text-subhead font-semibold text-ink-900">Alerts</h2>
                  <button
                    onClick={() => setOpenMenu(null)}
                    className="p-1 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-surface-100"
                    aria-label="Close alerts"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ul className="divide-y divide-line max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <li key={n.id} className="p-3.5 flex items-start gap-3 hover:bg-surface-50 transition-colors">
                      <span
                        className={cn(
                          'p-1.5 rounded-lg flex-shrink-0 border',
                          n.urgent
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-brand-50 text-brand-600 border-brand-100'
                        )}
                      >
                        {n.urgent ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-footnote font-semibold text-ink-900 truncate">{n.title}</span>
                          <span className="text-caption text-ink-400 font-mono flex-shrink-0">{n.time}</span>
                        </span>
                        <span className="block text-caption text-ink-500 mt-0.5">{n.desc}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
              className="flex items-center gap-2 h-9 pl-1 pr-1 sm:pr-2 rounded-xl hover:bg-surface-100 transition-colors"
              aria-label="Account menu"
              aria-expanded={openMenu === 'profile'}
            >
              <span className="w-8 h-8 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center text-footnote font-semibold">
                {initialsOf(user?.fullName)}
              </span>
              <span className="hidden lg:block text-left max-w-[9rem]">
                <span className="block text-footnote font-semibold text-ink-900 truncate">
                  {user?.fullName || 'Account'}
                </span>
                <span className="block text-caption text-ink-400 truncate">
                  {user?.role ? user.role.replace(/_/g, ' ') : ''}
                </span>
              </span>
            </button>

            {openMenu === 'profile' && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-line rounded-2xl shadow-elevated overflow-hidden animate-scale-in z-50">
                <div className="p-3.5 bg-surface-50 border-b border-line">
                  <p className="text-subhead font-semibold text-ink-900 truncate">{user?.fullName || 'Account'}</p>
                  <p className="text-caption text-ink-400 truncate">{user?.email}</p>
                  {user?.role && (
                    <p className="text-caption text-brand-700 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" aria-hidden="true" /> {user.role.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-subhead text-ink-700 hover:bg-surface-100 transition-colors"
                  >
                    <User className="w-4 h-4 text-ink-400" aria-hidden="true" />
                    Profile & settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-subhead text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
