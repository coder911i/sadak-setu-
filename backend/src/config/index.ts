import dotenv from 'dotenv';
dotenv.config();

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

// Origins of the project's own deployed frontends. Always allowed so the app
// keeps working when CORS_ORIGIN is unset or misconfigured on the host.
const BUILT_IN_ORIGINS = ['https://sadak-setu.vercel.app', 'https://sadak-setu-*.vercel.app'];

export const normalizeOrigin = (origin: string): string =>
  origin.trim().replace(/\/+$/, '').toLowerCase();

export const parseCorsOrigins = (raw?: string, env = 'development'): string[] => {
  const configured = (raw || '').split(',').map(normalizeOrigin).filter(Boolean);
  const defaults = env === 'production' ? BUILT_IN_ORIGINS : [...BUILT_IN_ORIGINS, ...DEV_ORIGINS];
  return Array.from(new Set([...configured, ...defaults.map(normalizeOrigin)]));
};

export const isOriginAllowed = (origin: string, allowed: string[]): boolean => {
  const candidate = normalizeOrigin(origin);
  return allowed.some((entry) => {
    if (entry === '*') return true;
    if (!entry.includes('*')) return entry === candidate;
    const pattern = new RegExp(
      `^${entry.split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^./]*')}$`
    );
    return pattern.test(candidate);
  });
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN, process.env.NODE_ENV || 'development'),

  jwt: {
    secret: process.env.JWT_SECRET || 'sadak-setu-super-secret-production-jwt-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'sadak-setu-super-secret-refresh-key-2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  ai: {
    mode: (process.env.AI_MODE || 'mock') as 'mock' | 'live',
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '15000', 10),
  },

  iot: {
    mode: (process.env.IOT_MODE || 'mock') as 'mock' | 'live',
  },

  sensor: {
    mode: (process.env.SENSOR_ML_MODE || 'mock') as 'mock' | 'live',
    serviceUrl: process.env.SENSOR_ML_SERVICE_URL || 'http://localhost:8000',
    timeoutMs: parseInt(process.env.SENSOR_ML_TIMEOUT_MS || '20000', 10),
    confidenceThreshold: parseFloat(process.env.SENSOR_ML_CONFIDENCE_THRESHOLD || '0.85'),
    autoComplaintEnabled: process.env.SENSOR_ML_AUTO_COMPLAINT_ENABLED === 'true',
    dedupRadiusMeters: parseFloat(process.env.SENSOR_ML_DEDUP_RADIUS_METERS || '10.0'),
    dedupWindowSeconds: parseInt(process.env.SENSOR_ML_DEDUP_WINDOW_SECONDS || '300', 10),
  },

  storage: {
    provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3' | 'r2',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || './uploads',
    endpoint: process.env.STORAGE_ENDPOINT,
    bucket: process.env.STORAGE_BUCKET || 'sadak-setu-media',
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    region: process.env.STORAGE_REGION || 'auto',
  },

  scoringWeights: {
    severity: parseFloat(process.env.SCORE_WEIGHT_SEVERITY || '0.40'),
    density: parseFloat(process.env.SCORE_WEIGHT_DENSITY || '0.30'),
    vibration: parseFloat(process.env.SCORE_WEIGHT_VIBRATION || '0.20'),
    location: parseFloat(process.env.SCORE_WEIGHT_LOCATION || '0.10'),
  },
};
