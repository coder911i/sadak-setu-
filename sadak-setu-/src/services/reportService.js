import { apiService } from './apiService';

export const reportService = {
  getAnalytics: async () => {
    try {
      const response = await apiService.analytics.overview();
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  getRoadAnalytics: async () => {
    try {
      const response = await apiService.analytics.roads();
      return response.data;
    } catch (error) {
      console.error('Error fetching road analytics:', error);
      throw error;
    }
  },

  getDamageAnalytics: async () => {
    try {
      const response = await apiService.analytics.damage();
      return response.data;
    } catch (error) {
      console.error('Error fetching damage analytics:', error);
      throw error;
    }
  },

  getMaintenanceAnalytics: async () => {
    try {
      const response = await apiService.analytics.maintenance();
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance analytics:', error);
      throw error;
    }
  },

  getVerificationAnalytics: async () => {
    try {
      const response = await apiService.analytics.verification();
      return response.data;
    } catch (error) {
      console.error('Error fetching verification analytics:', error);
      throw error;
    }
  }
};
