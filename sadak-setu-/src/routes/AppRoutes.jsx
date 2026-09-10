import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { DashboardPage } from '../pages/DashboardPage';
import { RoadsPage } from '../pages/RoadsPage';
import { RoadDetailPage } from '../pages/RoadDetailPage';
import { InspectionsPage } from '../pages/InspectionsPage';
import { DamageIntelligencePage } from '../pages/DamageIntelligencePage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { VerificationPage } from '../pages/VerificationPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoginPage } from '../pages/LoginPage';
import { useAuth } from '../context/AuthContext';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
