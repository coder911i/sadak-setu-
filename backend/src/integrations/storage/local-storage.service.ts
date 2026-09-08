import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService, UploadResult } from './storage.interface';
import { config } from '../../config';

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(config.storage.localUploadDir);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(buffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult> {
    const ext = path.extname(originalFilename) || '.bin';
    const storageKey = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, storageKey);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${storageKey}`;
    return {
      url: publicUrl,
      storageKey,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}
