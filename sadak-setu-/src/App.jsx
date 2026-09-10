import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { RoadProvider } from './context/RoadContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <RoadProvider>
            <MaintenanceProvider>
              <AppRoutes />
            </MaintenanceProvider>
          </RoadProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
