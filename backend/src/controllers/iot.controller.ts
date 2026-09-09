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
   *   • Zod validation of payload (supports snake_case and camelCase, missing GPS, sensor failures).
   *   • Device credential check via `X-Device-Secret` header vs device `apiKeyHash`.
   *   • Anti-impersonation check: device credentials must match the requested deviceId,
   *     and optional `X-Device-Id` header must match body `deviceId`.
   *   • Idempotency / replay check: returns existing record if deviceId + event timestamp already exists.
   *   • Persists raw telemetry and extracted windowed telemetry into NeonDB.
   *   • Returns raw & processed telemetry with explicit eventTimestamp vs ingestedAt separation.
   */
  static async ingestTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate payload
      const parseResult = telemetryPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return ApiResponse.badRequest(res, 'Invalid telemetry payload', parseResult.error.format());
      }
      const payload = parseResult.data;

      // 2. Device credential check – X-Device-Secret header
      const deviceSecret = req.headers['x-device-secret'];
      if (typeof deviceSecret !== 'string' || deviceSecret.trim().length === 0) {
        return ApiResponse.unauthorized(res, 'Missing device secret header (X-Device-Secret)');
      }

      // 3. Anti-impersonation: if X-Device-Id header is provided, it must match payload.deviceId
      const headerDeviceId = req.headers['x-device-id'];
      if (typeof headerDeviceId === 'string' && headerDeviceId.trim().length > 0) {
        if (headerDeviceId.trim().toLowerCase() !== payload.deviceId.trim().toLowerCase()) {
          return ApiResponse.forbidden(res, 'Device identity mismatch: X-Device-Id does not match payload deviceId');
        }
      }

      // 4. Authenticate device against database
      const device = await prisma.device.findFirst({
        where: {
          OR: [
            { deviceCode: payload.deviceId },
            { id: payload.deviceId },
          ],
        },
      });
      if (!device) {
        return ApiResponse.unauthorized(res, `Device not found or not registered: ${payload.deviceId}`);
      }
      if (!device.apiKeyHash) {
        return ApiResponse.unauthorized(res, 'Device credentials not configured for this device');
      }

      const isValidSecret = await PasswordUtil.compare(deviceSecret, device.apiKeyHash);
      if (!isValidSecret) {
        return ApiResponse.unauthorized(res, 'Invalid device credentials');
      }

      // 5. Idempotency & duplicate/replay handling
      let eventTimestamp: Date;
      if (payload.timestamp) {
        const parsed = new Date(payload.timestamp);
        eventTimestamp = isNaN(parsed.getTime()) ? new Date() : parsed;
      } else {
        eventTimestamp = new Date();
      }

      const existing = await prisma.deviceTelemetry.findFirst({
        where: { deviceId: device.id, timestamp: eventTimestamp },
      });
      if (existing) {
        return ApiResponse.success(
          res,
          {
            ...existing,
            eventTimestamp: existing.timestamp.toISOString(),
            duplicate: true,
          },
          'Telemetry already ingested (idempotent duplicate ignored)'
        );
      }

      // 6. Ingest raw telemetry and run feature extraction via DeviceService
      const result = await deviceService.ingestTelemetry(device.id, {
        ...payload,
        timestamp: eventTimestamp,
      });

      return ApiResponse.created(res, result, 'Telemetry ingested successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const iotController = new IoTController();

