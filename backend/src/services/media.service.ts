import crypto from 'crypto';
import { storageService } from '../integrations/storage';
import { inspectionRepository } from '../repositories/inspection.repository';
import { auditRepository } from '../repositories/audit.repository';
import { MediaType } from '@prisma/client';

export class MediaService {
  async uploadInspectionMedia(
    inspectionId: string,
    file: Express.Multer.File,
    metadata: {
      type?: MediaType;
      latitude?: number;
      longitude?: number;
      chainage?: number;
    },
    userId?: string
  ) {
    const inspection = await inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw { statusCode: 404, message: 'Inspection not found', code: 'INSPECTION_NOT_FOUND' };
    }

    // 1. Calculate MD5 / SHA-256 Checksum
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // 2. Upload via Storage Abstraction (Local/S3/R2)
    const uploadResult = await storageService.uploadFile(file.buffer, file.originalname, file.mimetype);

    // 3. Save to database
    const mediaAsset = await inspectionRepository.createMediaAsset({
      inspection: { connect: { id: inspectionId } },
      type: metadata.type || (file.mimetype.startsWith('video/') ? MediaType.VIDEO : MediaType.IMAGE),
      url: uploadResult.url,
      storageKey: uploadResult.storageKey,
      mimeType: uploadResult.mimeType,
      sizeBytes: uploadResult.sizeBytes,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      chainage: metadata.chainage,
      checksum,
      metadata: { originalName: file.originalname },
    });

    await auditRepository.log({
      userId,
      action: 'MEDIA_UPLOADED',
      entity: 'MediaAsset',
      entityId: mediaAsset.id,
      metadata: { inspectionId, url: mediaAsset.url, type: mediaAsset.type },
    });

    return mediaAsset;
  }

  async getMediaById(id: string) {
    const media = await inspectionRepository.findMediaById(id);
    if (!media) {
      throw { statusCode: 404, message: 'Media asset not found', code: 'MEDIA_NOT_FOUND' };
    }
    return media;
  }

  async deleteMedia(id: string, userId?: string) {
    const media = await this.getMediaById(id);
    await storageService.deleteFile(media.storageKey);
    const deleted = await inspectionRepository.deleteMedia(id);

    await auditRepository.log({
      userId,
      action: 'MEDIA_DELETED',
      entity: 'MediaAsset',
      entityId: id,
    });

    return deleted;
  }
}

export const mediaService = new MediaService();
