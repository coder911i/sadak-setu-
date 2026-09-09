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
} from 'lucide-react';

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
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
      label: 'Roads',
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
      badgeClass: 'bg-red-100 text-red-700 border border-red-200',
    },
    {
      id: 'damage-intelligence',
      label: 'Damage Intelligence',
      path: '/damage-intelligence',
      icon: BrainCircuit,
      badge: 'AI v4',
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
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
          'bg-white border-[#ddeae0] shadow-md md:shadow-sm',
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'
        )}
      >
        {/* Top Header: Logo & Brand */}
        <div className="p-4 border-b border-[#ddeae0] flex items-center justify-between gap-3">
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center p-2 shadow-sm flex-shrink-0 group-hover:bg-brand-700 transition-colors">
              <img src="/logo.svg" alt="Sadak Setu Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-brand-800 group-hover:text-brand-600 transition-colors">
                    SADAK SETU
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-mono font-bold">
                    Govt. AI
                  </span>
                </div>
                <p className="text-[10px] text-[#7a9a83] truncate">Road Health & Intelligence</p>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="text-[#7a9a83] hover:text-brand-700 p-1.5 rounded-lg hover:bg-brand-50 transition-colors hidden md:flex items-center justify-center cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="text-[#7a9a83] hover:text-brand-700 p-1.5 rounded-lg hover:bg-brand-50 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: Deploy Inspection */}
        <div className="p-3 border-b border-[#ddeae0]">
          <button
            onClick={() => {
              navigate('/inspections');
              handleNavClick();
            }}
            className={cn(
              'w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer',
              isCollapsed && !isMobileOpen ? 'p-2.5' : 'py-2.5 px-3 text-xs'
            )}
            title="Deploy AI Road Scan"
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Deploy Inspection</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {(!isCollapsed || isMobileOpen) && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7a9a83] px-3 pb-2 pt-1">
              Command Modules
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer relative',
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm font-semibold'
                      : 'text-[#4a6b55] hover:text-brand-700 hover:bg-brand-50 border border-transparent'
                  )}
                >
                  {/* Left Active bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-600" />
                  )}

                  <Icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-brand-600' : 'text-[#7a9a83] group-hover:text-brand-600'
                    )}
                  />

                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap',
                            item.badgeClass || 'bg-surface-100 text-[#4a6b55] border border-[#ddeae0]'
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
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-white border border-[#ddeae0] text-[#1a3825] text-xs font-medium rounded-xl shadow-elevated z-50 whitespace-nowrap pointer-events-none animate-fade-in flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section: User Info & Logout */}
        <div className="p-3 border-t border-[#ddeae0] bg-surface-50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* User Avatar + Name */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  AS
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate flex-1">
                  <div className="text-xs font-bold text-[#1a3825] truncate leading-tight">
                    Er. Alok Sharma
                  </div>
                  <div className="text-[10px] text-[#7a9a83] truncate">
                    Chief Engineer (MoRTH)
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#7a9a83] hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer"
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
