import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],

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
