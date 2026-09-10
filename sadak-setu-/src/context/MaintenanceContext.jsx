import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { maintenanceService } from '../services/maintenanceService';
import { useToast } from '../hooks/useToast';
import { useAuth } from './AuthContext';

const MaintenanceContext = createContext(null);

export function MaintenanceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { success, info } = useToast();

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getWorkOrders();
      setWorkOrders(data);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchWorkOrders();
  }, [fetchWorkOrders, isAuthenticated]);

  const addWorkOrder = async (orderData) => {
    const created = await maintenanceService.createWorkOrder(orderData);
    setWorkOrders((prev) => [created, ...prev]);
    success('Work Order Created', `Order #${created.id} has been sanctioned and routed to division.`);
    return created;
  };

  const updateStatus = async (orderId, newStatus, progress = null) => {
    const updated = await maintenanceService.updateWorkOrderStatus(orderId, newStatus, progress);
    setWorkOrders((prev) => prev.map((wo) => (wo.id === orderId ? updated : wo)));
    info('Status Updated', `Work Order #${orderId} moved to ${newStatus.replace('_', ' ').toUpperCase()}`);
    return updated;
  };

  const filteredOrders = workOrders.filter((wo) => {
    if (statusFilter !== 'all' && wo.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && wo.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <MaintenanceContext.Provider
      value={{
        workOrders: filteredOrders,
        allWorkOrders: workOrders,
        loading,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        addWorkOrder,
        updateStatus,
        refreshWorkOrders: fetchWorkOrders,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenanceContext() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceContext must be used within MaintenanceProvider');
  }
  return context;
}
