import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Plus, BarChart3, MoreHorizontal } from 'lucide-react';

export function MobileBottomNav({ onOpenReportModal }) {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isMap = location.pathname === '/roads';
  const isReports = location.pathname === '/reports';
  const isMore = location.pathname === '/settings';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2ebe4] md:hidden px-2 py-1.5 shadow-[0_-4px_16px_rgba(14,56,35,0.06)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            isHome ? 'text-brand-700 font-bold' : 'text-[#728a79] hover:text-[#123320]'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </NavLink>

        {/* 2. Map */}
        <NavLink
          to="/roads"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            isMap ? 'text-brand-700 font-bold' : 'text-[#728a79] hover:text-[#123320]'
          }`}
        >
          <div className="relative">
            <Map className="w-5 h-5" />
            {isMap && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Map</span>
        </NavLink>

        {/* 3. + Report (Floating Center Action Button) */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
          aria-label="Report new road issue"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 group-active:scale-95 transition-transform border-3 border-white ring-2 ring-brand-100">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-brand-800 mt-0.5">Report</span>
        </button>

        {/* 4. Reports */}
        <NavLink
          to="/reports"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            isReports ? 'text-brand-700 font-bold' : 'text-[#728a79] hover:text-[#123320]'
          }`}
        >
          <div className="relative">
            <BarChart3 className="w-5 h-5" />
            {isReports && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Reports</span>
        </NavLink>

        {/* 5. More */}
        <NavLink
          to="/settings"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            isMore ? 'text-brand-700 font-bold' : 'text-[#728a79] hover:text-[#123320]'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {isMore && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">More</span>
        </NavLink>
      </div>
    </nav>
  );
}
