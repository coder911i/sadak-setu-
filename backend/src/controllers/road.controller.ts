import { Request, Response, NextFunction } from 'express';
import { roadService } from '../services/road.service';
import { healthScoreService } from '../services/health-score.service';
import { ApiResponse } from '../utils/api-response';

export class RoadController {
  static async getAllRoads(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, state, district, status, search } = req.query;
      const result = await roadService.getAllRoads({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        state: state as string,
        district: district as string,
        status: status as any,
        search: search as string,
      });

      return ApiResponse.success(res, result.roads, 'Roads retrieved successfully', 200, {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string, 10) : 20)),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoadById(req: Request, res: Response, next: NextFunction) {
    try {
      const road = await roadService.getRoadById(req.params.id as string);
      return ApiResponse.success(res, road, 'Road retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createRoad(req: Request, res: Response, next: NextFunction) {
    try {
      const road = await roadService.createRoad(req.body, req.user?.userId);
      return ApiResponse.created(res, road, 'Road created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateRoad(req: Request, res: Response, next: NextFunction) {
    try {
      const road = await roadService.updateRoad(req.params.id as string, req.body, req.user?.userId);
      return ApiResponse.success(res, road, 'Road updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteRoad(req: Request, res: Response, next: NextFunction) {
    try {
      await roadService.deleteRoad(req.params.id as string, req.user?.userId);
      return ApiResponse.success(res, null, 'Road deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getRoadSegments(req: Request, res: Response, next: NextFunction) {
    try {
      const segments = await roadService.getRoadSegments(req.params.id as string);
      return ApiResponse.success(res, segments, 'Road segments retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createRoadSegment(req: Request, res: Response, next: NextFunction) {
    try {
      const segment = await roadService.createRoadSegment(req.params.id as string, req.body, req.user?.userId);
      return ApiResponse.created(res, segment, 'Segment created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getRoadHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await healthScoreService.getLatestRoadHealth(req.params.id as string);
      return ApiResponse.success(res, health, 'Road health score retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getRoadHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await roadService.getRoadHistory(req.params.id as string);
      return ApiResponse.success(res, history, 'Road history retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getRoadInspections(req: Request, res: Response, next: NextFunction) {
    try {
      const inspections = await roadService.getRoadInspections(req.params.id as string);
      return ApiResponse.success(res, inspections, 'Road inspections retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getRoadMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const cases = await roadService.getRoadMaintenance(req.params.id as string);
      return ApiResponse.success(res, cases, 'Road maintenance cases retrieved');
    } catch (error) {
      next(error);
    }
  }
}
