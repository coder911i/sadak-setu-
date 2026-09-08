import { Request, Response, NextFunction } from 'express';
import { healthScoreService } from '../services/health-score.service';
import { ApiResponse } from '../utils/api-response';

export class ScoringController {
  static async calculateScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { roadId, segmentId, weights } = req.body;
      const result = await healthScoreService.calculateRoadHealth(roadId, segmentId, weights);
      return ApiResponse.created(res, result, 'Road Health Score calculated and persisted');
    } catch (error) {
      next(error);
    }
  }

  static async getRoadHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const score = await healthScoreService.getLatestRoadHealth(req.params.roadId as string);
      return ApiResponse.success(res, score, 'Road Health Score retrieved');
    } catch (error) {
      next(error);
    }
  }
}
