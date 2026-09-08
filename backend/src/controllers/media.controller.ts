import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/media.service';
import { ApiResponse } from '../utils/api-response';

export class MediaController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, 'No media file provided');
      }

      const { inspectionId, latitude, longitude, chainage, type } = req.body;
      if (!inspectionId) {
        return ApiResponse.badRequest(res, 'inspectionId is required');
      }

      const media = await mediaService.uploadInspectionMedia(
        inspectionId,
        req.file,
        {
          type,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          chainage: chainage ? parseFloat(chainage) : undefined,
        },
        req.user?.userId
      );

      return ApiResponse.created(res, media, 'Media uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMediaById(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.getMediaById(req.params.id as string);
      return ApiResponse.success(res, media, 'Media asset retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      await mediaService.deleteMedia(req.params.id as string, req.user?.userId);
      return ApiResponse.success(res, null, 'Media asset deleted');
    } catch (error) {
      next(error);
    }
  }
}
