import { Request, Response, NextFunction } from 'express';
import { sensorMLService } from '../services/sensor-ml.service';
import { ApiResponse } from '../utils/api-response';
import { SensorInferenceRequest } from '../integrations/ai/sensor-client';

export class SensorMLController {
  /**
   * POST /api/v1/sensor/predict
   * Manually trigger sensor ML analysis for a telemetry window
   */
  static async predictAnomaly(req: Request, res: Response, next: NextFunction) {
    try {
      const request: SensorInferenceRequest = req.body;
      
      // Validate required fields
      if (!request.device_id || !request.timestamp || !request.sensor_window) {
        return ApiResponse.badRequest(res, 'Missing required fields: device_id, timestamp, sensor_window');
      }

      const result = await sensorMLService.processSensorTelemetry(request);
      
      return ApiResponse.success(res, result, 'Sensor ML analysis completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sensor/health
   * Health check for sensor ML service
   */
  static async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await sensorMLService.healthCheck();
      return ApiResponse.success(res, health, 'Sensor ML service health check');
    } catch (error) {
      next(error);
    }
  }
}

export const sensorMLController = new SensorMLController();