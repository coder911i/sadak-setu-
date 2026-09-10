import { apiService } from './apiService';

export const roadService = {
  getRoads: async (params = {}) => {
    try {
      const response = await apiService.roads.list(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching roads:', error);
      throw error;
    }
  },

  getRoadById: async (id) => {
    try {
      const response = await apiService.roads.getById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching road:', error);
      throw error;
    }
  },

  getRoadHealth: async (id) => {
    try {
      const response = await apiService.roads.getHealth(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching road health:', error);
      throw error;
    }
  },

  getRoadHistory: async (id) => {
    try {
      const response = await apiService.roads.getHistory(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching road history:', error);
      throw error;
    }
  },

  getRoadInspections: async (id) => {
    try {
      const response = await apiService.roads.getInspections(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching road inspections:', error);
      throw error;
    }
  },

  getRoadMaintenance: async (id) => {
    try {
      const response = await apiService.roads.getMaintenance(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching road maintenance:', error);
      throw error;
    }
  },

  getCorridorStats: async () => {
    try {
      const response = await apiService.analytics.overview();
      return response.data;
    } catch (error) {
      console.error('Error fetching corridor stats:', error);
      throw error;
    }
  },

  createRoad: async (data) => {
    try {
      const response = await apiService.roads.create(data);
      return response.data;
    } catch (error) {
      console.error('Error creating road:', error);
      throw error;
    }
  }
};
