import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/api-response';

export class AnalyticsController {
  static async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getOverview();
      return ApiResponse.success(res, data, 'Analytics overview retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getRoadsAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getRoadAnalytics();
      return ApiResponse.success(res, data, 'Road health analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getDamageAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDamageDistribution();
      return ApiResponse.success(res, data, 'Damage distribution analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMaintenanceAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getMaintenanceAnalytics();
      return ApiResponse.success(res, data, 'Maintenance status analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getVerificationAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getVerificationAnalytics();
      return ApiResponse.success(res, data, 'Verification success rate analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}
