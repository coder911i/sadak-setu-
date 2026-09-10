import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandSearchModal } from './CommandSearchModal';
import { ReportIssueModal } from '../common/ReportIssueModal';
import { WelcomeSplashScreen } from '../common/WelcomeSplashScreen';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden antialiased bg-[#f8faf8]">
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        />

        {/* Scrollable Page Body with bottom padding on mobile for MobileBottomNav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet context={{ onOpenReportModal: () => setIsReportModalOpen(true) }} />
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (md:hidden) */}
      <MobileBottomNav onOpenReportModal={() => setIsReportModalOpen(true)} />

      {/* Global Cmd+K Search Modal */}
      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Global Quick Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Welcome / Splash Screen Modal */}
      <WelcomeSplashScreen
        forceOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />
    </div>
  );
}
