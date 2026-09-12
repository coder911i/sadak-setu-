import {
  LayoutDashboard,
  Route,
  ScanEye,
  BrainCircuit,
  Wrench,
  ShieldCheck,
  BarChart3,
  Settings,
} from 'lucide-react';

// Single source of truth for navigation: the desktop sidebar, the mobile tab
// bar and the "More" sheet all read from this list.
export const NAV_ITEMS = [
  { id: 'dashboard',           label: 'Home',         longLabel: 'Command Center',      path: '/',                    icon: LayoutDashboard, primary: true },
  { id: 'roads',               label: 'Roads',        longLabel: 'Roads & Corridors',   path: '/roads',               icon: Route,           primary: true },
  { id: 'inspections',         label: 'Inspect',      longLabel: 'AI Inspections',      path: '/inspections',         icon: ScanEye,         primary: true },
  { id: 'maintenance',         label: 'Repairs',      longLabel: 'Maintenance',         path: '/maintenance',         icon: Wrench,          primary: true },
  { id: 'damage-intelligence', label: 'Damage AI',    longLabel: 'Damage Intelligence', path: '/damage-intelligence', icon: BrainCircuit },
  { id: 'verification',        label: 'Verification', longLabel: 'Quality Verification',path: '/verification',        icon: ShieldCheck },
  { id: 'reports',             label: 'Reports',      longLabel: 'Reports & Analytics', path: '/reports',             icon: BarChart3 },
  { id: 'settings',            label: 'Settings',     longLabel: 'System Settings',     path: '/settings',            icon: Settings },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((item) => item.primary);
export const SECONDARY_NAV = NAV_ITEMS.filter((item) => !item.primary);

export const ROUTE_META = {
  '/':                    { title: 'Command Center',        subtitle: 'Road health, alerts and live telemetry' },
  '/roads':               { title: 'Roads & Corridors',     subtitle: 'Pavement inventory, health scores and chainage' },
  '/inspections':         { title: 'AI Inspections',        subtitle: 'Vision detections and vibration telemetry' },
  '/damage-intelligence': { title: 'Damage Intelligence',   subtitle: 'Defect matrix and structural hotspots' },
  '/maintenance':         { title: 'Maintenance',           subtitle: 'Work orders, sanctions and SLA queue' },
  '/verification':        { title: 'Quality Verification',  subtitle: 'Before/after evidence and IRC:111 audits' },
  '/reports':             { title: 'Reports & Analytics',   subtitle: 'Trends, forecasting and regional dossiers' },
  '/settings':            { title: 'Settings',              subtitle: 'Detection calibration and node health' },
};

export const routeMetaFor = (pathname) => {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  const match = Object.keys(ROUTE_META)
    .filter((path) => path !== '/' && pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_META[match] : { title: 'Sadak Setu', subtitle: 'Public road intelligence' };
};

export const isNavActive = (pathname, path) =>
  path === '/' ? pathname === '/' : pathname.startsWith(path);
