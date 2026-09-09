export const MOCK_ANALYTICS = {
  pciDistribution: [
    { name: 'Good (85-100)', value: 42, count: 580, color: '#16a34a' },
    { name: 'Satisfactory (70-84)', value: 28, count: 386, color: '#65a30d' },
    { name: 'Fair (55-69)', value: 18, count: 248, color: '#d97706' },
    { name: 'Poor (40-54)', value: 8, count: 110, color: '#ea580c' },
    { name: 'Critical (0-39)', value: 4, count: 56, color: '#dc2626' },
  ],

  defectBreakdown: [
    { name: 'Potholes', count: 142, percentage: 38, avgDepthCm: 7.2, color: '#dc2626' },
    { name: 'Alligator Cracks', count: 98, percentage: 26, avgDepthCm: 2.8, color: '#ea580c' },
    { name: 'Rutting & Depressions', count: 56, percentage: 15, avgDepthCm: 4.5, color: '#d97706' },
    { name: 'Longitudinal Cracks', count: 45, percentage: 12, avgDepthCm: 1.8, color: '#2563eb' },
    { name: 'Edge Drops', count: 34, percentage: 9, avgDepthCm: 9.0, color: '#7c3aed' },
  ],

  monthlyTrend: [
    { month: 'Apr 2026', detected: 84, repaired: 78, avgPci: 76.2 },
    { month: 'May 2026', detected: 92, repaired: 89, avgPci: 75.8 },
    { month: 'Jun 2026', detected: 145, repaired: 110, avgPci: 72.4 }, // Pre-monsoon spike
    { month: 'Jul 2026', detected: 210, repaired: 165, avgPci: 68.1 }, // Peak Monsoon distress
    { month: 'Aug 2026', detected: 185, repaired: 198, avgPci: 71.5 }, // Rapid repair surge
    { month: 'Sep 2026', detected: 124, repaired: 142, avgPci: 74.8 },
  ],

  corridorComparison: [
    { corridor: 'NE-1', pci: 91, iri: 1.4, lengthKm: 93, defectsPer100Km: 3.2, complianceRate: 98 },
    { corridor: 'SH-10', pci: 88, iri: 1.6, lengthKm: 118, defectsPer100Km: 5.1, complianceRate: 95 },
    { corridor: 'NH-44', pci: 74, iri: 2.3, lengthKm: 204, defectsPer100Km: 6.8, complianceRate: 91 },
    { corridor: 'NH-19', pci: 68, iri: 2.7, lengthKm: 440, defectsPer100Km: 4.8, complianceRate: 88 },
    { corridor: 'NH-48', pci: 59, iri: 3.1, lengthKm: 260, defectsPer100Km: 10.7, complianceRate: 79 },
    { corridor: 'NH-66', pci: 52, iri: 3.6, lengthKm: 245, defectsPer100Km: 13.9, complianceRate: 74 },
  ],

  budgetDeployment: [
    { division: 'North Zone', sanctioned: 48.5, utilized: 38.2, pending: 10.3 },
    { division: 'West Zone', sanctioned: 36.0, utilized: 31.4, pending: 4.6 },
    { division: 'South Zone', sanctioned: 28.0, utilized: 25.8, pending: 2.2 },
    { division: 'East Zone', sanctioned: 22.5, utilized: 16.1, pending: 6.4 },
    { division: 'Central Zone', sanctioned: 18.0, utilized: 12.9, pending: 5.1 },
  ],

  deteriorationForecast: [
    { year: '2026', traditionalApproach: 74, sadakSetuAI: 74 },
    { year: '2027', traditionalApproach: 67, sadakSetuAI: 79 },
    { year: '2028', traditionalApproach: 58, sadakSetuAI: 83 },
    { year: '2029', traditionalApproach: 49, sadakSetuAI: 85 },
    { year: '2030', traditionalApproach: 41, sadakSetuAI: 87 },
  ],
};
