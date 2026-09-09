import { MOCK_AUDITS } from '../data/mockAudits';
import { MOCK_ANALYTICS } from '../data/mockAnalytics';

export const reportService = {
  getAudits: async () => {
    await new Promise((r) => setTimeout(r, 150));
    const saved = localStorage.getItem('sadak_setu_audits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_AUDITS;
  },

  getAuditById: async (id) => {
    const list = await reportService.getAudits();
    return list.find((a) => a.id === id) || null;
  },

  updateAuditStatus: async (id, status, notes = '') => {
    const list = await reportService.getAudits();
    const updated = list.map((a) => (a.id === id ? { ...a, status, verificationNotes: notes } : a));
    localStorage.setItem('sadak_setu_audits', JSON.stringify(updated));
    return updated.find((a) => a.id === id);
  },

  getAnalytics: async () => {
    await new Promise((r) => setTimeout(r, 100));
    return MOCK_ANALYTICS;
  },
};
