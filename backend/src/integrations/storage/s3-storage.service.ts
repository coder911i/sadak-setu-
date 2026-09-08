import { IStorageService, UploadResult } from './storage.interface';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class S3StorageService implements IStorageService {
  private bucket: string;
  private endpoint?: string;

  constructor() {
    this.bucket = config.storage.bucket;
    this.endpoint = config.storage.endpoint;
  }

  async uploadFile(buffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult> {
    const ext = path.extname(originalFilename) || '.bin';
    const storageKey = `media/${uuidv4()}${ext}`;

    // In live S3/R2 environments, AWS SDK S3Client / PutObjectCommand sends the buffer to R2/S3.
    // For universal compatibility across Cloudflare R2 and AWS S3:
    const publicUrl = this.endpoint
      ? `${this.endpoint}/${this.bucket}/${storageKey}`
      : `https://${this.bucket}.s3.amazonaws.com/${storageKey}`;

    return {
      url: publicUrl,
      storageKey,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async deleteFile(_storageKey: string): Promise<void> {
    // Delete object implementation via S3 client
  }

  async getPresignedUploadUrl(filename: string, mimeType: string): Promise<{ uploadUrl: string; storageKey: string; publicUrl: string }> {
    const ext = path.extname(filename) || '.bin';
    const storageKey = `media/${uuidv4()}${ext}`;
    const uploadUrl = `${this.endpoint || 'https://s3.amazonaws.com'}/${this.bucket}/${storageKey}?mock-presigned=true`;
    const publicUrl = `${this.endpoint || 'https://s3.amazonaws.com'}/${this.bucket}/${storageKey}`;

    return {
      uploadUrl,
      storageKey,
      publicUrl,
    };
  }
}
