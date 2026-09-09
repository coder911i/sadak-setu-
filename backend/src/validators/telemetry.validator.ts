import { z } from 'zod';

// Schema for raw telemetry payload sent from ESP32 devices
export const telemetryPayloadSchema = z.object({
  // Accept deviceCode string (e.g. ESP32-SURV-001) or UUID
  deviceId: z.string().min(1, 'Device ID or code is required'),
  // Event timestamp sent by device (optional, falls back to server clock if missing)
  timestamp: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO timestamp' })
    .optional(),
  inspectionId: z.string().uuid().optional().nullable(),
  // GPS fields: optional & nullable (missing GPS allowed)
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  speed: z.number().nonnegative().optional().nullable(),
  // Accelerometer: snake_case and camelCase, sensor failure tolerant
  accel_x: z.number().optional().nullable(),
  accel_y: z.number().optional().nullable(),
  accel_z: z.number().optional().nullable(),
  accelerometerX: z.number().optional().nullable(),
  accelerometerY: z.number().optional().nullable(),
  accelerometerZ: z.number().optional().nullable(),
  // Gyroscope: snake_case and camelCase, sensor failure tolerant
  gyro_x: z.number().optional().nullable(),
  gyro_y: z.number().optional().nullable(),
  gyro_z: z.number().optional().nullable(),
  gyroX: z.number().optional().nullable(),
  gyroY: z.number().optional().nullable(),
  gyroZ: z.number().optional().nullable(),
  // Ultrasonic sensors: failure tolerant
  distance_1: z.number().optional().nullable(),
  distance_2: z.number().optional().nullable(),
  ultrasonic1: z.number().optional().nullable(),
  ultrasonic2: z.number().optional().nullable(),
  // Dynamic vibration
  vibrationIntensity: z.number().optional().nullable(),
});

export type TelemetryPayload = z.infer<typeof telemetryPayloadSchema>;

