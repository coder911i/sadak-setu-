import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { deviceService } from '../services/device.service';
import { telemetryPayloadSchema } from '../validators/telemetry.validator';
import { prisma } from '../config/database';
import { PasswordUtil } from '../utils/password';

export class IoTController {
  /**
   * POST /api/v1/iot/telemetry
   * Ingest raw telemetry from ESP32 devices.
   * Performs:
   *   • JWT‑less device authentication via `deviceId` & `X-Device-Secret` (bcrypt vs `apiKeyHash`).
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

      // Device credential check – X-Device-Secret compared against stored apiKeyHash.
      const deviceSecret = req.headers['x-device-secret'];
      if (typeof deviceSecret !== 'string' || deviceSecret.length === 0) {
        return ApiResponse.unauthorized(res, 'Missing device secret');
      }
      const device = await prisma.device.findUnique({ where: { deviceCode: payload.deviceId } });
      if (!device?.apiKeyHash) {
        return ApiResponse.unauthorized(res, 'Invalid device credentials');
      }
      const isValidSecret = await PasswordUtil.compare(deviceSecret, device.apiKeyHash);
      if (!isValidSecret) {
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
