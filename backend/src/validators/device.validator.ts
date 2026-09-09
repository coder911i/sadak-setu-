import { z } from 'zod';
import { DeviceType, DeviceStatus } from '@prisma/client';

export const createDeviceSchema = z.object({
  deviceCode: z.string().min(2, 'Device code required'),
  name: z.string().min(2, 'Device name required'),
  type: z.nativeEnum(DeviceType).default(DeviceType.SMARTPHONE),
  firmwareVersion: z.string().optional(),
  apiKey: z.string().min(6, 'API key / secret must be at least 6 characters').optional(),
});


export const updateDeviceSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(DeviceStatus).optional(),
  firmwareVersion: z.string().optional(),
});

export const telemetryPayloadSchema = z.object({
  inspectionId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().nonnegative().optional().default(0),
  accelerometerX: z.number().optional().default(0),
  accelerometerY: z.number().optional().default(0),
  accelerometerZ: z.number().optional().default(0),
  gyroX: z.number().optional().default(0),
  gyroY: z.number().optional().default(0),
  gyroZ: z.number().optional().default(0),
  vibrationIntensity: z.number().optional(),
});

export const batchTelemetrySchema = z.object({
  telemetry: z.array(telemetryPayloadSchema).min(1, 'At least one telemetry record required'),
});
