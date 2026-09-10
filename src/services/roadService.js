import { MOCK_ROADS } from '../data/mockRoads';

export const roadService = {
  getRoads: async () => {
    // Simulated realistic client fetch delay
    await new Promise((r) => setTimeout(r, 150));
    const saved = localStorage.getItem('sadak_setu_roads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_ROADS;
  },

  getRoadById: async (id) => {
    const roads = await roadService.getRoads();
    return roads.find((r) => r.id === id || r.code === id) || null;
  },

  getCorridorStats: async () => {
    const roads = await roadService.getRoads();
    const totalKm = roads.reduce((acc, r) => acc + r.totalLengthKm, 0);
    const avgPci = Math.round(roads.reduce((acc, r) => acc + r.pciScore, 0) / roads.length);
    const totalDefects = roads.reduce((acc, r) => acc + r.activeDefectsCount, 0);
    const criticalDefects = roads.reduce((acc, r) => acc + r.criticalDefectsCount, 0);

    return {
      totalKm: Math.round(totalKm),
      avgPci,
      totalCorridors: roads.length,
      totalDefects,
      criticalDefects,
    };
  },
};
