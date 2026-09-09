import { MOCK_INSPECTIONS } from '../data/mockInspections';

export const inspectionService = {
  getInspections: async () => {
    await new Promise((r) => setTimeout(r, 150));
    const saved = localStorage.getItem('sadak_setu_inspections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_INSPECTIONS;
  },

  getInspectionById: async (id) => {
    const list = await inspectionService.getInspections();
    return list.find((i) => i.id === id) || null;
  },

  createInspection: async (newInspection) => {
    const list = await inspectionService.getInspections();
    const created = {
      ...newInspection,
      id: `insp-${Date.now().toString().slice(-4)}`,
      detectedAt: new Date().toISOString(),
      status: 'detected',
      confidenceScore: newInspection.confidenceScore || 95.5,
      riskScore: newInspection.riskScore || 75,
    };
    const updated = [created, ...list];
    localStorage.setItem('sadak_setu_inspections', JSON.stringify(updated));
    return created;
  },

  updateInspectionStatus: async (id, status, workOrderId = null) => {
    const list = await inspectionService.getInspections();
    const updated = list.map((i) => (i.id === id ? { ...i, status, workOrderId: workOrderId || i.workOrderId } : i));
    localStorage.setItem('sadak_setu_inspections', JSON.stringify(updated));
    return updated.find((i) => i.id === id);
  },
};
