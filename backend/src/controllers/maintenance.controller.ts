import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from '../services/maintenance.service';
import { verificationService } from '../services/verification.service';
import { ApiResponse } from '../utils/api-response';

export class MaintenanceController {
  static async getAllCases(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, roadId, status, priority, teamId } = req.query;
      const result = await maintenanceService.getAllCases({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        roadId: roadId as string,
        status: status as any,
        priority: priority as any,
        teamId: teamId as string,
      });

      return ApiResponse.success(res, result.cases, 'Maintenance cases retrieved', 200, {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string, 10) : 20)),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCaseById(req: Request, res: Response, next: NextFunction) {
    try {
      const mCase = await maintenanceService.getCaseById(req.params.id as string);
      return ApiResponse.success(res, mCase, 'Maintenance case retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createCase(req: Request, res: Response, next: NextFunction) {
    try {
      const mCase = await maintenanceService.createCase(req.body, req.user!.userId);
      return ApiResponse.created(res, mCase, 'Maintenance case created');
    } catch (error) {
      next(error);
    }
  }

  static async assignTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, expectedCompletionDate, notes } = req.body;
      const updated = await maintenanceService.assignTeam(
        req.params.id as string,
        teamId,
        req.user!.userId,
        expectedCompletionDate,
        notes
      );
      return ApiResponse.success(res, updated, 'Maintenance case assigned to team');
    } catch (error) {
      next(error);
    }
  }

  static async acceptCase(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await maintenanceService.acceptCase(req.params.id as string, req.user!.userId, req.user!.role);
      return ApiResponse.success(res, updated, 'Case accepted by maintenance team');
    } catch (error) {
      next(error);
    }
  }

  static async startWork(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await maintenanceService.startWork(req.params.id as string, req.user!.userId, req.user!.role);
      return ApiResponse.success(res, updated, 'Repair work started');
    } catch (error) {
      next(error);
    }
  }

  static async submitRepair(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.submitRepairAndVerify(
        req.params.id as string,
        req.body,
        req.user!.userId,
        req.user!.role
      );
      return ApiResponse.success(res, result, 'Repair evidence submitted and AI verification processed');
    } catch (error) {
      next(error);
    }
  }

  static async reopenCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const updated = await maintenanceService.reopenCase(req.params.id as string, req.user!.userId, req.user!.role, reason);
      return ApiResponse.success(res, updated, 'Case reopened');
    } catch (error) {
      next(error);
    }
  }

  static async closeCase(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await maintenanceService.closeCase(req.params.id as string, req.user!.userId, req.user!.role);
      return ApiResponse.success(res, updated, 'Case officially closed');
    } catch (error) {
      next(error);
    }
  }
}
