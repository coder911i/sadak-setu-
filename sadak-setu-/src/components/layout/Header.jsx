import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useRoads } from '../../hooks/useRoads';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { ROAD_DIVISIONS } from '../../utils/constants';
import {
  Menu,
  Bell,
  Search,
  Radio,
  Clock,
  ChevronRight,
  User,
  Shield,
  Layers,
  Sparkles,
  LogOut,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

const ROUTE_TITLES = {
  '/': { title: 'Command Center', subtitle: 'National Highway Health & Telemetry Hub' },
  '/roads': { title: 'Roads & Corridors', subtitle: 'Pavement Inventory, IRI & Chainage Heatmaps' },
  '/inspections': { title: 'AI Road Inspections', subtitle: 'Vision Sensor Detections & Vibration G-Force Data' },
  '/damage-intelligence': { title: 'Damage Intelligence', subtitle: 'AI Failure Matrix & Structural Defect Hotspots' },
  '/maintenance': { title: 'Maintenance Operations', subtitle: 'Work Order Kanban, Budget Sanctions & SLA Queue' },
  '/verification': { title: 'Quality Verification', subtitle: 'Before/After Patch Verification & IRC:111 Audits' },
  '/reports': { title: 'Reports & Forecasting', subtitle: 'Degradation Modeling & Regional Budget Dossiers' },
  '/settings': { title: 'System Settings', subtitle: 'Edge AI Vision Calibration & Node Health' },
};

export function Header({ onOpenSearch, onToggleMobileSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedZone, setSelectedZone } = useRoads();
  const { info, success } = useToast();
  const { user, logout } = useAuth();

  const [timeStr, setTimeStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const routeMeta = ROUTE_TITLES[location.pathname] || {
    title: 'Sadak Setu Command',
    subtitle: 'Public Infrastructure Intelligence System',
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Level-1 Critical Pothole',
      desc: 'NH-48 Km 62+400 – 9.5cm depth (High collision hazard)',
      time: '12m ago',
      urgent: true,
    },
    {
      id: 2,
      title: 'Work Order Completed',
      desc: 'WO-2026-0884 (NH-44 Palwal) moved to Quality Audit Queue',
      time: '45m ago',
      urgent: false,
    },
    {
      id: 3,
      title: 'Drone LiDAR Scan Synced',
      desc: 'High-density point cloud updated for NE-1 Expressway',
      time: '2h ago',
      urgent: false,
    },
  ];

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await logout();
      info('Session Terminated', 'Logged out from Sadak Setu Central Command Portal.');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-[#ddeae0] shadow-sm">
      {/* Top Institutional Ribbon */}
      <div
        className="px-4 py-1.5 border-b border-[#ddeae0] flex items-center justify-between text-[11px]"
        style={{ background: 'linear-gradient(135deg, #1a5c38 0%, #2d8a5a 100%)' }}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse flex-shrink-0" />
          <span className="font-semibold tracking-wide text-white/90 truncate">
            MINISTRY OF ROAD TRANSPORT &amp; HIGHWAYS (MoRTH) &bull; CENTRAL ROAD INTELLIGENCE DIVISION
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-4 font-mono text-[10px] flex-shrink-0 text-white/80">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
            AI TELEMETRY: ONLINE
          </span>
          <span className="text-white/40">|</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-white/70" />
            {timeStr}
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Page Title & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl bg-surface-50 text-[#4a6b55] hover:text-brand-700 hover:bg-brand-50 border border-[#ddeae0] transition-colors md:hidden cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title & Breadcrumbs */}
          <div className="min-w-0 space-y-0.5">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1 text-[11px] font-medium text-[#7a9a83]">
              <Link to="/" className="hover:text-brand-600 transition-colors">
                Sadak Setu
              </Link>
              <ChevronRight className="w-3 h-3 text-[#b5ccbc]" />
              <span className="text-[#1a3825] font-semibold truncate">{routeMeta.title}</span>
            </nav>

            {/* Current Page Title */}
            <h2 className="text-base sm:text-lg font-bold text-[#1a3825] tracking-tight leading-tight truncate">
              {routeMeta.title}
            </h2>
          </div>
        </div>

        {/* Right Section: Zone Selector, Search, Notifications, User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Regional Zone Selector (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 bg-surface-50 border border-[#ddeae0] px-3 py-1.5 rounded-xl text-xs">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span className="text-[#7a9a83]">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent font-semibold text-[#1a3825] focus:outline-none cursor-pointer"
            >
              {ROAD_DIVISIONS.map((div) => (
                <option key={div.id} value={div.id} className="bg-white text-[#1a3825]">
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-50 border border-[#ddeae0] text-xs text-[#7a9a83] hover:text-brand-700 hover:border-brand-300 hover:bg-brand-50 transition-colors cursor-pointer"
            title="Spotlight Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-surface-100 text-[#7a9a83] border border-[#ddeae0] rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setUnreadCount(0);
              }}
              className="relative p-2 rounded-xl bg-surface-50 border border-[#ddeae0] text-[#4a6b55] hover:text-brand-700 hover:bg-brand-50 hover:border-brand-200 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#ddeae0] rounded-2xl shadow-elevated z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-[#ddeae0] flex items-center justify-between bg-surface-50">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#1a3825]">System Telemetry Alerts</h4>
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-brand-100 text-brand-700 font-mono border border-brand-200">
                      Live
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[#7a9a83] hover:text-[#1a3825] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-[#ddeae0] max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 hover:bg-surface-50 transition-colors flex items-start gap-3 cursor-pointer"
                    >
                      <div
                        className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                          n.urgent
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-brand-50 text-brand-600 border border-brand-200'
                        }`}
                      >
                        {n.urgent ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-[#1a3825] truncate">{n.title}</p>
                          <span className="text-[10px] text-[#7a9a83] font-mono whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#4a6b55] mt-0.5 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button with Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-brand-50 transition-colors cursor-pointer border border-transparent hover:border-brand-200"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AS'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-[#1a3825] leading-tight">{user ? user.fullName : 'Loading...'}</div>
                <div className="text-[10px] text-[#7a9a83]">{user ? user.role.replace('_', ' ') : 'Loading...'}</div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#ddeae0] rounded-2xl shadow-elevated z-50 overflow-hidden animate-fade-in text-xs">
                <div className="p-3.5 bg-surface-50 border-b border-[#ddeae0]">
                  <div className="font-bold text-[#1a3825]">{user ? user.fullName : 'Loading...'}</div>
                  <div className="text-[#7a9a83] text-[11px]">{user ? user.email : 'Loading...'}</div>
                  <div className="text-[10px] font-mono text-brand-600 mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Role: {user ? user.role.replace('_', ' ') : 'Loading...'}
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      success('Profile Verified', 'Sadak Setu credentials active & digitally signed.');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#4a6b55] hover:text-brand-700 hover:bg-brand-50 text-left transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-brand-600" />
                    <span>Profile Information</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer border-t border-[#ddeae0] mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
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
