import { apiService } from './apiService';

export const inspectionService = {
  getInspections: async (params = {}) => {
    try {
      const response = await apiService.inspections.list(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw error;
    }
  },

  getInspectionById: async (id) => {
    try {
      const response = await apiService.inspections.getById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching inspection:', error);
      throw error;
    }
  },

  startInspection: async (data) => {
    try {
      const response = await apiService.inspections.start(data);
      return response.data;
    } catch (error) {
      console.error('Error starting inspection:', error);
      throw error;
    }
  },

  completeInspection: async (id, data) => {
    try {
      const response = await apiService.inspections.complete(id, data);
      return response.data;
    } catch (error) {
      console.error('Error completing inspection:', error);
      throw error;
    }
  },

  getFusionData: async (id) => {
    try {
      const response = await apiService.inspections.getFusion(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching fusion data:', error);
      throw error;
    }
  }
};
