import { useState, useEffect, useCallback } from 'react';
import { inspectionService } from '../services/inspectionService';
import { useToast } from './useToast';

export function useInspections(initialFilters = {}) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    defectType: 'all',
    roadId: 'all',
    status: 'all',
    ...initialFilters,
  });
  const { success, info } = useToast();

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inspectionService.getInspections();
      setInspections(data);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const addInspection = async (defectData) => {
    const created = await inspectionService.createInspection(defectData);
    setInspections((prev) => [created, ...prev]);
    success('Inspection Logged', `Defect ${created.id} (${created.defectType}) registered at ${created.chainage}`);
    return created;
  };

  const updateStatus = async (id, status, workOrderId = null) => {
    const updated = await inspectionService.updateInspectionStatus(id, status, workOrderId);
    setInspections((prev) => prev.map((item) => (item.id === id ? updated : item)));
    info('Inspection Updated', `Defect status changed to ${status.toUpperCase()}`);
    return updated;
  };

  const filteredInspections = inspections.filter((item) => {
    if (filters.severity !== 'all' && item.severity !== filters.severity) return false;
    if (filters.defectType !== 'all' && item.defectType !== filters.defectType) return false;
    if (filters.roadId !== 'all' && item.roadId !== filters.roadId) return false;
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    return true;
  });

  return {
    inspections: filteredInspections,
    allInspections: inspections,
    loading,
    filters,
    setFilters,
    addInspection,
    updateStatus,
    refreshInspections: fetchInspections,
  };
}
