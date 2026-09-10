import { apiService } from './apiService';

export const maintenanceService = {
  getCases: async (params = {}) => {
    try {
      const response = await apiService.maintenance.listCases(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance cases:', error);
      throw error;
    }
  },

  getCaseById: async (id) => {
    try {
      const response = await apiService.maintenance.getCaseById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance case:', error);
      throw error;
    }
  },

  createCase: async (data) => {
    try {
      const response = await apiService.maintenance.createCase(data);
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance case:', error);
      throw error;
    }
  },

  assignTeam: async (caseId, data) => {
    try {
      const response = await apiService.maintenance.assignTeam(caseId, data);
      return response.data;
    } catch (error) {
      console.error('Error assigning team:', error);
      throw error;
    }
  },

  acceptCase: async (caseId) => {
    try {
      const response = await apiService.maintenance.acceptCase(caseId);
      return response.data;
    } catch (error) {
      console.error('Error accepting case:', error);
      throw error;
    }
  },

  startWork: async (caseId) => {
    try {
      const response = await apiService.maintenance.startWork(caseId);
      return response.data;
    } catch (error) {
      console.error('Error starting work:', error);
      throw error;
    }
  },

  submitRepair: async (caseId, data) => {
    try {
      const response = await apiService.maintenance.submitRepair(caseId, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting repair:', error);
      throw error;
    }
  },

  closeCase: async (caseId) => {
    try {
      const response = await apiService.maintenance.closeCase(caseId);
      return response.data;
    } catch (error) {
      console.error('Error closing case:', error);
      throw error;
    }
  },

  overrideVerification: async (caseId, data) => {
    try {
      const response = await apiService.maintenance.overrideVerification(caseId, data);
      return response.data;
    } catch (error) {
      console.error('Error overriding verification:', error);
      throw error;
    }
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
