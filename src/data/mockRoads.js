export const MOCK_ROADS = [
  {
    id: 'road-pmgsy-14',
    code: 'PMGSY VR-14',
    name: 'Alwar – Thanagazi Rural Link Road',
    category: 'Rural PMGSY (Pradhan Mantri Gram Sadak Yojana)',
    zone: 'north',
    state: 'Rajasthan',
    district: 'Alwar',
    totalLengthKm: 28.4,
    lanes: 2,
    surfaceType: 'Bituminous Macadam with Surface Dressing',
    trafficDensity: 'Moderate (Rural Agri Freight & Tractors)',
    healthScore: 38, // 0 - 100
    pciScore: 38,
    priority: 'Immediate', // 'Immediate' | 'High' | 'Monitor'
    iriScore: 4.8, // International Roughness Index (m/km)
    latestInspection: '2026-09-08T16:45:00Z',
    inspectionAgency: 'AI Mobile Dashcam Survey Unit-03',
    contractor: 'Rajasthan PWD Rural Roadways',
    damageCount: 19,
    potholesCount: 11,
    cracksCount: 6,
    otherDamageCount: 2,
    criticalDefectsCount: 5,
    coordinates: [
      [27.5530, 76.6346], // Alwar
      [27.4800, 76.4500], // Kushalgarh
      [27.4000, 76.3200], // Thanagazi
    ],
    segments: [
      { id: 'seg-r1', startKm: 0, endKm: 10, name: 'Alwar Outskirts – Umren Junction', pci: 52, iri: 3.8, defects: 4, status: 'poor' },
      { id: 'seg-r2', startKm: 10, endKm: 20, name: 'Umren – Kushalgarh Hill Stretch', pci: 32, iri: 5.4, defects: 11, status: 'critical' },
      { id: 'seg-r3', startKm: 20, endKm: 28.4, name: 'Kushalgarh – Thanagazi Gram Panchayat', pci: 36, iri: 5.1, defects: 4, status: 'critical' },
    ],
  },
  {
    id: 'road-mdr-42',
    code: 'MDR-42',
    name: 'Nashik – Trimbakeshwar Major District Link',
    category: 'Major District Road (MDR)',
    zone: 'west',
    state: 'Maharashtra',
    district: 'Nashik',
    totalLengthKm: 32.0,
    lanes: 2,
    surfaceType: 'Bituminous Concrete (BC)',
    trafficDensity: 'High (Pilgrimage & Inter-Taluka Transit)',
    healthScore: 54,
    pciScore: 54,
    priority: 'High',
    iriScore: 3.4,
    latestInspection: '2026-09-08T11:20:00Z',
    inspectionAgency: 'Autonomous Drone LiDAR Survey-02',
    contractor: 'Dilip Buildcon Rural Unit',
    damageCount: 14,
    potholesCount: 7,
    cracksCount: 5,
    otherDamageCount: 2,
    criticalDefectsCount: 2,
    coordinates: [
      [19.9975, 73.7898], // Nashik
      [19.9600, 73.6500], // Anjaneri
      [19.9380, 73.5300], // Trimbakeshwar
    ],
    segments: [
      { id: 'seg-m1', startKm: 0, endKm: 15, name: 'Nashik Bypass – Anjaneri University node', pci: 64, iri: 2.9, defects: 4, status: 'moderate' },
      { id: 'seg-m2', startKm: 15, endKm: 32, name: 'Anjaneri – Trimbakeshwar Ghat Pass', pci: 46, iri: 3.8, defects: 10, status: 'poor' },
    ],
  },
  {
    id: 'road-odr-08',
    code: 'ODR-08',
    name: 'Barabanki – Fatehpur Agri Corridor',
    category: 'Other District Road (ODR)',
    zone: 'north',
    state: 'Uttar Pradesh',
    district: 'Barabanki',
    totalLengthKm: 46.5,
    lanes: 2,
    surfaceType: 'Semi-Dense Bituminous Concrete',
    trafficDensity: 'Moderate (Sugarcane Freight & Rural Buses)',
    healthScore: 42,
    pciScore: 42,
    priority: 'Immediate',
    iriScore: 4.2,
    latestInspection: '2026-09-08T09:00:00Z',
    inspectionAgency: 'AI Mobile Survey Unit-04',
    contractor: 'UP State PWD Construction Unit-II',
    damageCount: 22,
    potholesCount: 13,
    cracksCount: 6,
    otherDamageCount: 3,
    criticalDefectsCount: 4,
    coordinates: [
      [26.9270, 81.1834], // Barabanki
      [27.0500, 81.2400], // Deva Sharif Node
      [27.1700, 81.2200], // Fatehpur Tehsil
    ],
    segments: [
      { id: 'seg-o1', startKm: 0, endKm: 20, name: 'Barabanki City – Deva Sharif Section', pci: 58, iri: 3.2, defects: 6, status: 'moderate' },
      { id: 'seg-o2', startKm: 20, endKm: 46.5, name: 'Deva – Fatehpur Sugarcane Route', pci: 34, iri: 4.9, defects: 16, status: 'critical' },
    ],
  },
  {
    id: 'road-nh48',
    code: 'NH-48 (Sec-3)',
    name: 'Jaipur – Kishangarh Express Corridor',
    category: 'National Highway (NHAI)',
    zone: 'north',
    state: 'Rajasthan',
    district: 'Jaipur / Ajmer',
    totalLengthKm: 98.0,
    lanes: 6,
    surfaceType: 'Stone Matrix Asphalt (SMA)',
    trafficDensity: 'Extreme (Heavy Commercial Multi-Axle Freight)',
    healthScore: 61,
    pciScore: 61,
    priority: 'High',
    iriScore: 2.8,
    latestInspection: '2026-09-08T18:15:00Z',
    inspectionAgency: 'AI Dashcam Van (High-Speed)',
    contractor: 'Larsen & Toubro Infra Solutions',
    damageCount: 16,
    potholesCount: 8,
    cracksCount: 5,
    otherDamageCount: 3,
    criticalDefectsCount: 3,
    coordinates: [
      [26.9124, 75.7873], // Jaipur
      [26.7800, 75.4500], // Bagru Industrial Area
      [26.6500, 75.1200], // Dudu
      [26.5700, 74.8600], // Kishangarh
    ],
    segments: [
      { id: 'seg-nh1', startKm: 0, endKm: 30, name: 'Jaipur Bypass – Bagru Toll Plaza', pci: 76, iri: 2.1, defects: 3, status: 'good' },
      { id: 'seg-nh2', startKm: 30, endKm: 70, name: 'Bagru – Dudu Industrial Transit Stretch', pci: 52, iri: 3.4, defects: 9, status: 'poor' },
      { id: 'seg-nh3', startKm: 70, endKm: 98, name: 'Dudu – Kishangarh Marble Corridor', pci: 63, iri: 2.7, defects: 4, status: 'moderate' },
    ],
  },
  {
    id: 'road-pmgsy-mp09',
    code: 'PMGSY MP-09',
    name: 'Vidisha – Sanchi Rural Heritage Connector',
    category: 'Rural PMGSY',
    zone: 'central',
    state: 'Madhya Pradesh',
    district: 'Vidisha / Raisen',
    totalLengthKm: 22.8,
    lanes: 2,
    surfaceType: 'Pavement Quality Concrete (Rigid White-Topping)',
    trafficDensity: 'Moderate (Tourism & Rural Commuters)',
    healthScore: 89,
    pciScore: 89,
    priority: 'Monitor',
    iriScore: 1.6,
    latestInspection: '2026-09-07T14:30:00Z',
    inspectionAgency: 'Autonomous Drone LiDAR Survey-01',
    contractor: 'Madhya Pradesh Rural Road Dev Corp (MPRRDA)',
    damageCount: 2,
    potholesCount: 0,
    cracksCount: 2,
    otherDamageCount: 0,
    criticalDefectsCount: 0,
    coordinates: [
      [23.5251, 77.8081], // Vidisha
      [23.4900, 77.7600], // Betwa River Bridge
      [23.4800, 77.7400], // Sanchi
    ],
    segments: [
      { id: 'seg-v1', startKm: 0, endKm: 12, name: 'Vidisha Outer – Betwa Approach', pci: 92, iri: 1.5, defects: 1, status: 'good' },
      { id: 'seg-v2', startKm: 12, endKm: 22.8, name: 'Betwa – Sanchi Stupa Access Link', pci: 87, iri: 1.7, defects: 1, status: 'good' },
    ],
  },
  {
    id: 'road-sh-10',
    code: 'SH-10',
    name: 'Bengaluru – Ramanagara State Expressway Connector',
    category: 'State Highway (SH)',
    zone: 'south',
    state: 'Karnataka',
    district: 'Ramanagara',
    totalLengthKm: 48.0,
    lanes: 4,
    surfaceType: 'Polymer Modified Bitumen (PMB)',
    trafficDensity: 'High (62,000 PCU/day)',
    healthScore: 86,
    pciScore: 86,
    priority: 'Monitor',
    iriScore: 1.7,
    latestInspection: '2026-09-08T14:00:00Z',
    inspectionAgency: 'AI Mobile Survey Unit-01',
    contractor: 'KRDCL Regional Maintenance Wing',
    damageCount: 4,
    potholesCount: 1,
    cracksCount: 2,
    otherDamageCount: 1,
    criticalDefectsCount: 0,
    coordinates: [
      [12.9716, 77.5946], // Bengaluru
      [12.8200, 77.4100], // Bidadi
      [12.7200, 77.2800], // Ramanagara
    ],
    segments: [
      { id: 'seg-s1', startKm: 0, endKm: 24, name: 'Kengeri – Bidadi Industrial Hub', pci: 88, iri: 1.6, defects: 2, status: 'good' },
      { id: 'seg-s2', startKm: 24, endKm: 48, name: 'Bidadi – Ramanagara Silk City Gate', pci: 84, iri: 1.8, defects: 2, status: 'good' },
    ],
  },
  {
    id: 'road-pmgsy-br22',
    code: 'PMGSY BR-22',
    name: 'Muzaffarpur – Motipur Rural Sugarcane Belt',
    category: 'Rural PMGSY',
    zone: 'east',
    state: 'Bihar',
    district: 'Muzaffarpur',
    totalLengthKm: 34.2,
    lanes: 2,
    surfaceType: 'Bituminous Macadam with Primer Seal',
    trafficDensity: 'Moderate-High (Flood Plain Agricultural Transit)',
    healthScore: 46,
    pciScore: 46,
    priority: 'Immediate',
    iriScore: 4.4,
    latestInspection: '2026-09-07T10:00:00Z',
    inspectionAgency: 'PWD Field Officer Inspection App',
    contractor: 'Bihar State Rural Road Dev Agency',
    damageCount: 21,
    potholesCount: 12,
    cracksCount: 5,
    otherDamageCount: 4,
    criticalDefectsCount: 5,
    coordinates: [
      [26.1209, 85.3647], // Muzaffarpur
      [26.1900, 85.2200], // Kanti
      [26.2800, 85.1100], // Motipur
    ],
    segments: [
      { id: 'seg-br1', startKm: 0, endKm: 18, name: 'Muzaffarpur Ring – Kanti Thermal Node', pci: 52, iri: 3.9, defects: 7, status: 'poor' },
      { id: 'seg-br2', startKm: 18, endKm: 34.2, name: 'Kanti – Motipur Monsoon Runoff Stretch', pci: 41, iri: 4.8, defects: 14, status: 'critical' },
    ],
  },
  {
    id: 'road-ne-1',
    code: 'NE-1',
    name: 'Ahmedabad – Vadodara National Expressway 1',
    category: 'National Expressway',
    zone: 'west',
    state: 'Gujarat',
    district: 'Ahmedabad / Anand / Vadodara',
    totalLengthKm: 93.1,
    lanes: 6,
    surfaceType: 'Rigid Concrete Pavement (PQC)',
    trafficDensity: 'High (54,000 PCU/day)',
    healthScore: 92,
    pciScore: 92,
    priority: 'Monitor',
    iriScore: 1.3,
    latestInspection: '2026-09-06T11:00:00Z',
    inspectionAgency: 'AI Mobile Survey Unit-01',
    contractor: 'IRB Infrastructure Developers',
    damageCount: 3,
    potholesCount: 0,
    cracksCount: 2,
    otherDamageCount: 1,
    criticalDefectsCount: 0,
    coordinates: [
      [23.0225, 72.5714], // Ahmedabad
      [22.8250, 72.7600], // Nadiad
      [22.5645, 72.9289], // Anand
      [22.3072, 73.1812], // Vadodara
    ],
    segments: [
      { id: 'seg-ne1', startKm: 0, endKm: 45, name: 'Ahmedabad Outer – Nadiad Section', pci: 94, iri: 1.2, defects: 1, status: 'good' },
      { id: 'seg-ne2', startKm: 45, endKm: 93.1, name: 'Nadiad – Vadodara Gateway', pci: 90, iri: 1.4, defects: 2, status: 'good' },
    ],
  },
];
