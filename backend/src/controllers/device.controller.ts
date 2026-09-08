import { Request, Response, NextFunction } from 'express';
import { deviceService } from '../services/device.service';
import { ApiResponse } from '../utils/api-response';

export class DeviceController {
  static async getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query;
      const result = await deviceService.getAllDevices({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        status: status as any,
      });

      return ApiResponse.success(res, result.devices, 'Devices retrieved', 200, {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDeviceById(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await deviceService.getDeviceById(req.params.id as string);
      return ApiResponse.success(res, device, 'Device retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await deviceService.registerDevice(req.body, req.user?.userId);
      return ApiResponse.created(res, device, 'Device registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async ingestTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const telemetry = await deviceService.ingestTelemetry(req.params.id as string, req.body);
      return ApiResponse.created(res, telemetry, 'Telemetry ingested successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { inspectionId, limit } = req.query;
      const telemetry = await deviceService.getTelemetry(
        req.params.id as string,
        inspectionId as string,
        limit ? parseInt(limit as string, 10) : 50
      );
      return ApiResponse.success(res, telemetry, 'Telemetry history retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async simulateTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude, count, inspectionId } = req.body;
      const stream = await deviceService.generateMockTelemetry(
        req.params.id as string,
        latitude || 28.6139,
        longitude || 77.209,
        count || 10,
        inspectionId
      );
      return ApiResponse.created(res, stream, 'Mock telemetry stream generated');
    } catch (error) {
      next(error);
    }
  }
}
