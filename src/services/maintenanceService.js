import { MOCK_WORK_ORDERS } from '../data/mockWorkOrders';

export const maintenanceService = {
  getWorkOrders: async () => {
    await new Promise((r) => setTimeout(r, 150));
    const saved = localStorage.getItem('sadak_setu_work_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_WORK_ORDERS;
  },

  getWorkOrderById: async (id) => {
    const list = await maintenanceService.getWorkOrders();
    return list.find((wo) => wo.id === id) || null;
  },

  createWorkOrder: async (newOrder) => {
    const list = await maintenanceService.getWorkOrders();
    const created = {
      ...newOrder,
      id: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: newOrder.status || 'triage',
      progressPercentage: 0,
    };
    const updated = [created, ...list];
    localStorage.setItem('sadak_setu_work_orders', JSON.stringify(updated));
    return created;
  },

  updateWorkOrderStatus: async (id, status, progressPercentage = null) => {
    const list = await maintenanceService.getWorkOrders();
    const updated = list.map((wo) => {
      if (wo.id === id) {
        return {
          ...wo,
          status,
          progressPercentage: progressPercentage !== null ? progressPercentage : wo.progressPercentage,
        };
      }
      return wo;
    });
    localStorage.setItem('sadak_setu_work_orders', JSON.stringify(updated));
    return updated.find((wo) => wo.id === id);
  },

  calculateEstimates: ({ areaSqM = 1, depthCm = 5, layerType = 'hot_mix' }) => {
    // Standard asphalt density ~2.4 tonnes/m³
    const volumeM3 = (Number(areaSqM) || 1) * ((Number(depthCm) || 5) / 100);
    const weightTonnes = volumeM3 * 2.4;
    const weightKg = Math.round(weightTonnes * 1000);

    // Cost rates in INR
    const ratesPerTonne = {
      hot_mix: 6500, // DBM / BC Bituminous Concrete
      cold_mix: 8200, // Ready cold-mix polymer emulsion
      micro_surfacing: 12000,
      concrete_pqc: 7800,
    };

    const rate = ratesPerTonne[layerType] || 6500;
    const materialCost = Math.round(weightTonnes * rate);
    const laborAndEquipmentCost = Math.round(materialCost * 0.75 + 15000); // Milling, roller, crew
    const estimatedTotal = materialCost + laborAndEquipmentCost;

    return {
      volumeM3: volumeM3.toFixed(3),
      weightKg,
      weightTonnes: weightTonnes.toFixed(2),
      materialCost,
      laborAndEquipmentCost,
      estimatedTotal,
    };
  },
};
