import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileTabBar } from './MobileTabBar';
import { CommandSearchModal } from './CommandSearchModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-brand-600 focus:text-white focus:text-subhead focus:font-semibold"
      >
        Skip to content
      </a>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((v) => !v)}
        />

        <main
          id="main-content"
          className="flex-1 content-shell py-4 sm:py-6 lg:py-8 pb-24 md:pb-10"
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      <MobileTabBar />

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
