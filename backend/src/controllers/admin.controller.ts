import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { auditService } from '../services/audit.service';
import { configService } from '../services/config.service';
import { ApiResponse } from '../utils/api-response';

export class AdminController {
  // Users
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, status } = req.query;
      const result = await userService.getAllUsers({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        role: role as any,
        status: status as any,
      });

      return ApiResponse.success(res, result.users, 'Users retrieved', 200, {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body, req.user?.userId);
      return ApiResponse.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id as string, req.body, req.user?.userId);
      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(req.params.id as string, req.user?.userId);
      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Audit Logs
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, userId, entity, action } = req.query;
      const result = await auditService.getLogs({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
        userId: userId as string,
        entity: entity as string,
        action: action as string,
      });

      return ApiResponse.success(res, result.logs, 'Audit logs retrieved', 200, {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });
    } catch (error) {
      next(error);
    }
  }

  // System Configuration
  static async getConfig(_req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await configService.getAllConfig();
      return ApiResponse.success(res, configs, 'System configuration retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async setConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value, description } = req.body;
      const config = await configService.setConfig(key, value, description, req.user?.userId);
      return ApiResponse.success(res, config, 'System configuration updated');
    } catch (error) {
      next(error);
    }
  }
}
