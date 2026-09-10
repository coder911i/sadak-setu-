export const DEFECT_TYPES = {
  POTHOLE: 'Pothole',
  ALLIGATOR_CRACKING: 'Alligator Cracking',
  LONGITUDINAL_CRACKING: 'Longitudinal Cracking',
  TRANSVERSE_CRACKING: 'Transverse Cracking',
  RUTTING: 'Rutting & Depression',
  RAVELLING: 'Ravelling / Stripping',
  EDGE_FAILURE: 'Edge Drop-off / Failure',
  CORRUGATION: 'Corrugation & Shoving',
};

export const SEVERITY_LEVELS = {
  CRITICAL: {
    label: 'Critical',
    value: 'critical',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-600',
    pciRange: '0 - 40',
  },
  HIGH: {
    label: 'High',
    value: 'high',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    dotClass: 'bg-orange-600',
    pciRange: '41 - 55',
  },
  MODERATE: {
    label: 'Moderate',
    value: 'moderate',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-600',
    pciRange: '56 - 70',
  },
  LOW: {
    label: 'Low / Good',
    value: 'low',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotClass: 'bg-emerald-600',
    pciRange: '71 - 100',
  },
};

export const WORK_ORDER_STATUSES = {
  TRIAGE: { label: 'In Triage', value: 'triage', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  BUDGET_APPROVED: { label: 'Sanctioned', value: 'budget_approved', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  ASSIGNED: { label: 'Assigned', value: 'assigned', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  IN_PROGRESS: { label: 'In Progress', value: 'in_progress', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  AUDIT_READY: { label: 'Audit Ready', value: 'audit_ready', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  VERIFIED_CLOSED: { label: 'Verified & Closed', value: 'verified_closed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  REWORK_REQUIRED: { label: 'Rework Required', value: 'rework_required', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export const ROAD_DIVISIONS = [
  { id: 'all', name: 'All National & State Corridors' },
  { id: 'north', name: 'Northern Zone (Delhi-NCR, Haryana, UP)' },
  { id: 'west', name: 'Western Zone (Gujarat, Maharashtra, Rajasthan)' },
  { id: 'south', name: 'Southern Zone (Karnataka, Tamil Nadu, Kerala)' },
  { id: 'east', name: 'Eastern Zone (West Bengal, Bihar, Odisha)' },
  { id: 'central', name: 'Central Zone (MP, Chhattisgarh)' },
];

export const CONTRACTORS = [
  { id: 'c-1', name: 'Larsen & Toubro Infra Solutions', rating: 4.8, activeWorkOrders: 6, avgTurnaroundDays: 4.2 },
  { id: 'c-2', name: 'Dilip Buildcon Roadways', rating: 4.6, activeWorkOrders: 4, avgTurnaroundDays: 5.1 },
  { id: 'c-3', name: 'IRB Infrastructure Developers', rating: 4.5, activeWorkOrders: 8, avgTurnaroundDays: 4.8 },
  { id: 'c-4', name: 'Ashoka Buildcon Engineering', rating: 4.7, activeWorkOrders: 5, avgTurnaroundDays: 3.9 },
  { id: 'c-5', name: 'PWD State Division-IV Maintenance Unit', rating: 4.1, activeWorkOrders: 11, avgTurnaroundDays: 7.3 },
];

export const INSPECTION_SOURCES = {
  AI_VAN: 'AI Dashcam Van (High-Speed)',
  DRONE: 'Autonomous LiDAR Drone',
  SMART_PHONE: 'Mobile Sensor Crowdsource',
  INSPECTOR: 'PWD Field Officer App',
};
