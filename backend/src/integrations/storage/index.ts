import { IStorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { config } from '../../config';

let storageServiceInstance: IStorageService;

if (config.storage.provider === 's3' || config.storage.provider === 'r2') {
  storageServiceInstance = new S3StorageService();
} else {
  storageServiceInstance = new LocalStorageService();
}

export const storageService = storageServiceInstance;
export * from './storage.interface';
