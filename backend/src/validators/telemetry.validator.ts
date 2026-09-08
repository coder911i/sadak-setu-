import { z } from 'zod';

// Schema for raw telemetry payload sent from ESP32 devices
export const telemetryPayloadSchema = z.object({
  deviceId: z.string().uuid(),
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO timestamp' }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accel_x: z.number(),
  accel_y: z.number(),
  accel_z: z.number(),
  gyro_x: z.number(),
  gyro_y: z.number(),
  gyro_z: z.number(),
  distance_1: z.number().nonnegative(),
  distance_2: z.number().nonnegative()
});

export type TelemetryPayload = z.infer<typeof telemetryPayloadSchema>;
