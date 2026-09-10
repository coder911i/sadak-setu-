import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useRoads } from '../../hooks/useRoads';
import { useToast } from '../../hooks/useToast';
import {
  LayoutDashboard,
  Route,
  ScanEye,
  BrainCircuit,
  Wrench,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  PlusCircle,
  Award,
} from 'lucide-react';

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenReportModal,
}) {
  const { stats } = useRoads();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Command Center',
      path: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'roads',
      label: 'Roads & Map',
      path: '/roads',
      icon: Route,
      badge: stats.totalCorridors ? `${stats.totalCorridors}` : '8',
    },
    {
      id: 'inspections',
      label: 'Inspections',
      path: '/inspections',
      icon: ScanEye,
      badge: stats.criticalDefects ? `${stats.criticalDefects} Alert` : '10',
      badgeClass: 'bg-red-50 text-red-700 border border-red-200',
    },
    {
      id: 'damage-intelligence',
      label: 'Damage AI',
      path: '/damage-intelligence',
      icon: BrainCircuit,
      badge: 'v4.8',
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
    {
      id: 'maintenance',
      label: 'Track Repairs',
      path: '/maintenance',
      icon: Wrench,
      badge: '4 Active',
    },
    {
      id: 'verification',
      label: 'Verification',
      path: '/verification',
      icon: ShieldCheck,
      badge: '3 Audit',
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleLogout = () => {
    info('Session Terminated', 'Logged out from Sadak Setu Central Command Portal.');
  };

  const handleNavClick = () => {
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 select-none',
          'bg-white border-[#e2ebe4] shadow-md md:shadow-none',
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'
        )}
      >
        {/* Top Header: Logo & Brand */}
        <div className="p-4 border-b border-[#e2ebe4] flex items-center justify-between gap-3 bg-[#f8faf8]">
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-700 flex items-center justify-center p-2 shadow-sm flex-shrink-0 group-hover:bg-brand-800 transition-colors ring-2 ring-brand-100">
              <img src="/logo.svg" alt="Sadak Setu Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-[#123320] group-hover:text-brand-700 transition-colors">
                    SADAK SETU
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold">
                    Govt. AI
                  </span>
                </div>
                <p className="text-[10px] text-[#728a79] truncate font-medium">Monitor &bull; Maintain &bull; Move Ahead</p>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="text-[#728a79] hover:text-brand-700 p-1.5 rounded-xl hover:bg-brand-50 transition-colors hidden md:flex items-center justify-center cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="text-[#728a79] hover:text-brand-700 p-1.5 rounded-xl hover:bg-brand-50 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: Report / Deploy Inspection */}
        <div className="p-3 border-b border-[#e2ebe4]">
          <button
            onClick={() => {
              if (onOpenReportModal) {
                onOpenReportModal();
              } else {
                navigate('/inspections');
              }
              handleNavClick();
            }}
            className={cn(
              'w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer',
              isCollapsed && !isMobileOpen ? 'p-2.5' : 'py-2.5 px-3 text-xs'
            )}
            title="Report Road Distress"
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Report Distress</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {(!isCollapsed || isMobileOpen) && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#728a79] px-3 pb-1.5 pt-1">
              Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

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
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer relative',
                    isActive
                      ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-sm'
                      : 'text-[#3b5e47] hover:text-brand-800 hover:bg-surface-50 border border-transparent'
                  )}
                >
                  {/* Left Active indicator pill */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-brand-700" />
                  )}

                  <Icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-brand-700' : 'text-[#728a79] group-hover:text-brand-700'
                    )}
                  />

                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap',
                            item.badgeClass || 'bg-surface-100 text-[#3b5e47] border border-[#e2ebe4]'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>

                {/* Floating Tooltip when collapsed on desktop */}
                {isCollapsed && !isMobileOpen && hoveredItem === item.id && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-white border border-[#e2ebe4] text-[#123320] text-xs font-bold rounded-xl shadow-elevated z-50 whitespace-nowrap pointer-events-none animate-fade-in flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Institutional Seal / Officer Info */}
        <div className="p-3 border-t border-[#e2ebe4] bg-surface-50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-800 to-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-brand-100">
                  AS
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate flex-1">
                  <div className="text-xs font-bold text-[#123320] truncate leading-tight">
                    Er. Alok Sharma
                  </div>
                  <div className="text-[10px] text-[#728a79] truncate">
                    Chief Engineer MoRTH
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-[#728a79] hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer"
              title="Sign Out / Terminate Session"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
