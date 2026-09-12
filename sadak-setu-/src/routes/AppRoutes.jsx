import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

// Map- and chart-heavy screens load on demand to keep the first paint light.
const RoadsPage = lazy(() => import('../pages/RoadsPage').then((m) => ({ default: m.RoadsPage })));
const RoadDetailPage = lazy(() => import('../pages/RoadDetailPage').then((m) => ({ default: m.RoadDetailPage })));
const InspectionsPage = lazy(() => import('../pages/InspectionsPage').then((m) => ({ default: m.InspectionsPage })));
const DamageIntelligencePage = lazy(() =>
  import('../pages/DamageIntelligencePage').then((m) => ({ default: m.DamageIntelligencePage }))
);
const MaintenancePage = lazy(() => import('../pages/MaintenancePage').then((m) => ({ default: m.MaintenancePage })));
const VerificationPage = lazy(() => import('../pages/VerificationPage').then((m) => ({ default: m.VerificationPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-canvas">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="roads" element={<RoadsPage />} />
        <Route path="roads/:id" element={<RoadDetailPage />} />
        <Route path="inspections" element={<InspectionsPage />} />
        <Route path="damage-intelligence" element={<DamageIntelligencePage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
