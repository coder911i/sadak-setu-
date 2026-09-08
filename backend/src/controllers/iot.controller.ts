import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { deviceService } from '../services/device.service';
import { telemetryPayloadSchema } from '../validators/telemetry.validator';
import { prisma } from '../config/database';

export class IoTController {
  /**
   * POST /api/v1/iot/telemetry
   * Ingest raw telemetry from ESP32 devices.
   * Performs:
   *   • JWT‑less device authentication via `deviceId` & secret (placeholder for now).
   *   • Zod validation of payload.
   *   • Idempotency check – if a record with the same deviceId && timestamp exists, returns it.
   *   • Stores raw telemetry via DeviceService.
   */
  static async ingestTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate payload
      const parseResult = telemetryPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return ApiResponse.badRequest(res, 'Invalid telemetry payload', parseResult.error.format());
      }
      const payload = parseResult.data;

      // Simple device credential check – expect a header X-Device-Secret matching stored secret.
      // In production, replace with a secure lookup.
      const deviceSecret = req.headers['x-device-secret'] as string | undefined;
      if (!deviceSecret) {
        return ApiResponse.unauthorized(res, 'Missing device secret');
      }
      const device = await prisma.device.findUnique({ where: { deviceCode: payload.deviceId } });
      if (!device || device.secret !== deviceSecret) {
        return ApiResponse.unauthorized(res, 'Invalid device credentials');
      }

      // Idempotency: check if telemetry with same deviceId & timestamp already stored.
      const existing = await prisma.deviceTelemetry.findFirst({
        where: { deviceId: device.id, timestamp: new Date(payload.timestamp) },
      });
      if (existing) {
        return ApiResponse.success(res, existing, 'Telemetry already ingested (idempotent)');
      }

      // Delegate to service for storage and feature extraction.
      const telemetry = await deviceService.ingestTelemetry(device.id, payload);
      return ApiResponse.created(res, telemetry, 'Telemetry ingested successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const iotController = new IoTController();
