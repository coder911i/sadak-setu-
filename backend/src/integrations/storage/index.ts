import { IStorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { config } from '../../config';
import { logger } from '../../utils/logger';

let storageServiceInstance: IStorageService;

if (config.storage.provider === 's3' || config.storage.provider === 'r2') {
  if (!config.storage.accessKey || !config.storage.secretKey) {
    logger.warn('[STORAGE] Cloud storage configured without full credentials. Set STORAGE_ACCESS_KEY and STORAGE_SECRET_KEY for live S3/R2.');
  }
  storageServiceInstance = new S3StorageService();
} else {
  if (config.env === 'production') {
    logger.warn('[STORAGE] Running in production with LocalStorage. Cloud container storage (Render/Vercel) is ephemeral; media will not persist across dyno restarts without STORAGE_PROVIDER=s3 or STORAGE_PROVIDER=r2.');
  }
  storageServiceInstance = new LocalStorageService();
}

export const storageService = storageServiceInstance;
export * from './storage.interface';
