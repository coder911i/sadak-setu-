import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { damageRepository } from '../repositories/damage.repository';
import { ApiResponse } from '../utils/api-response';

export class AiController {
  static async analyzeImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { mediaUrl, inspectionId, mediaId, latitude, longitude, chainage } = req.body;
      if (!mediaUrl || !inspectionId) {
        return ApiResponse.badRequest(res, 'mediaUrl and inspectionId are required');
      }

      const result = await aiService.analyzeImage(
        mediaUrl,
        inspectionId,
        mediaId,
        latitude,
        longitude,
        chainage,
        req.user?.userId
      );

      return ApiResponse.success(res, result, 'Image analysis completed');
    } catch (error) {
      next(error);
    }
  }

  static async analyzeVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { mediaUrl, inspectionId, latitude, longitude } = req.body;
      if (!mediaUrl || !inspectionId) {
        return ApiResponse.badRequest(res, 'mediaUrl and inspectionId are required');
      }

      const result = await aiService.analyzeVideo(mediaUrl, inspectionId, latitude, longitude, req.user?.userId);
      return ApiResponse.success(res, result, 'Video analysis completed');
    } catch (error) {
      next(error);
    }
  }

  static async getAnalysisById(req: Request, res: Response, next: NextFunction) {
    try {
      const detection = await damageRepository.findById(req.params.id as string);
      if (!detection) {
        return ApiResponse.notFound(res, 'Damage detection record not found');
      }
      return ApiResponse.success(res, detection, 'Damage detection retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async correctDamage(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await aiService.correctDamageDetection(req.params.id as string, req.body, req.user!.userId);
      return ApiResponse.success(res, updated, 'Damage detection corrected and audit logged');
    } catch (error) {
      next(error);
    }
  }
}
