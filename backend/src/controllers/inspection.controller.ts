import { Request, Response, NextFunction } from 'express';
import { inspectionService } from '../services/inspection.service';
import { fusionService } from '../services/fusion.service';
import { ApiResponse } from '../utils/api-response';

export class InspectionController {
  static async getAllInspections(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, roadId, inspectorId, status } = req.query;
      const result = await inspectionService.getAllInspections({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        roadId: roadId as string,
        inspectorId: inspectorId as string,
        status: status as any,
      });

      return ApiResponse.success(res, result.inspections, 'Inspections retrieved', 200, {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string, 10) : 20)),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInspectionById(req: Request, res: Response, next: NextFunction) {
    try {
      const inspection = await inspectionService.getInspectionById(req.params.id as string);
      return ApiResponse.success(res, inspection, 'Inspection retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const inspection = await inspectionService.startInspection({
        roadId: req.body.roadId,
        inspectorId: req.user!.userId,
        inspectionType: req.body.inspectionType,
        remarks: req.body.remarks,
      });

      return ApiResponse.created(res, inspection, 'Inspection started successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await inspectionService.updateInspection(req.params.id as string, req.body, req.user?.userId);
      return ApiResponse.success(res, updated, 'Inspection updated');
    } catch (error) {
      next(error);
    }
  }

  static async completeInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const completed = await inspectionService.completeInspection(req.params.id as string, req.body, req.user?.userId);
      return ApiResponse.success(res, completed, 'Inspection completed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getInspectionFusion(req: Request, res: Response, next: NextFunction) {
    try {
      const fusedData = await fusionService.fuseInspectionData(req.params.id as string);
      return ApiResponse.success(res, fusedData, 'Sensor and visual fusion calculated');
    } catch (error) {
      next(error);
    }
  }
}
