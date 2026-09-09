export interface RawTelemetryPayload {
  deviceId: string;
  inspectionId?: string | null;
  timestamp?: string | Date;
  latitude?: number | null;
  longitude?: number | null;
  speed?: number | null;
  accel_x?: number | null;
  accel_y?: number | null;
  accel_z?: number | null;
  accelerometerX?: number | null;
  accelerometerY?: number | null;
  accelerometerZ?: number | null;
  gyro_x?: number | null;
  gyro_y?: number | null;
  gyro_z?: number | null;
  gyroX?: number | null;
  gyroY?: number | null;
  gyroZ?: number | null;
  distance_1?: number | null;
  distance_2?: number | null;
  ultrasonic1?: number | null;
  ultrasonic2?: number | null;
  vibrationIntensity?: number | null;
}

export interface NormalizedTelemetry {
  deviceId: string;
  inspectionId?: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speed: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  vibrationIntensity: number;
}

export class DeviceAdapter {
  /**
   * Normalizes raw IoT device data from ESP32, smartphone sensors, or OBD-II telematics.
   * Tolerates missing GPS (defaults to 0.0) and sensor failures (defaults to 0.0).
   * Supports both snake_case (accel_x, gyro_x, distance_1) and camelCase (accelerometerX, gyroX, ultrasonic1).
   */
  static normalize(raw: RawTelemetryPayload): NormalizedTelemetry {
    const ax =
      typeof raw.accelerometerX === 'number' && Number.isFinite(raw.accelerometerX)
        ? raw.accelerometerX
        : typeof raw.accel_x === 'number' && Number.isFinite(raw.accel_x)
        ? raw.accel_x
        : 0.0;

    const ay =
      typeof raw.accelerometerY === 'number' && Number.isFinite(raw.accelerometerY)
        ? raw.accelerometerY
        : typeof raw.accel_y === 'number' && Number.isFinite(raw.accel_y)
        ? raw.accel_y
        : 0.0;

    const az =
      typeof raw.accelerometerZ === 'number' && Number.isFinite(raw.accelerometerZ)
        ? raw.accelerometerZ
        : typeof raw.accel_z === 'number' && Number.isFinite(raw.accel_z)
        ? raw.accel_z
        : 0.0;

    const gx =
      typeof raw.gyroX === 'number' && Number.isFinite(raw.gyroX)
        ? raw.gyroX
        : typeof raw.gyro_x === 'number' && Number.isFinite(raw.gyro_x)
        ? raw.gyro_x
        : 0.0;

    const gy =
      typeof raw.gyroY === 'number' && Number.isFinite(raw.gyroY)
        ? raw.gyroY
        : typeof raw.gyro_y === 'number' && Number.isFinite(raw.gyro_y)
        ? raw.gyro_y
        : 0.0;

    const gz =
      typeof raw.gyroZ === 'number' && Number.isFinite(raw.gyroZ)
        ? raw.gyroZ
        : typeof raw.gyro_z === 'number' && Number.isFinite(raw.gyro_z)
        ? raw.gyro_z
        : 0.0;

    const lat =
      typeof raw.latitude === 'number' && Number.isFinite(raw.latitude) ? raw.latitude : 0.0;
    const lon =
      typeof raw.longitude === 'number' && Number.isFinite(raw.longitude) ? raw.longitude : 0.0;
    const spd =
      typeof raw.speed === 'number' && Number.isFinite(raw.speed) ? Math.max(0, raw.speed) : 0.0;

    // Calculate dynamic vibration intensity (deviation from gravity 1G / 9.8 m/s^2)
    const totalG = Math.sqrt(ax * ax + ay * ay + az * az);
    const vibration =
      typeof raw.vibrationIntensity === 'number' && Number.isFinite(raw.vibrationIntensity)
        ? raw.vibrationIntensity
        : Math.max(0, Math.abs(totalG - 9.8));

    let eventTime: Date;
    if (raw.timestamp instanceof Date) {
      eventTime = raw.timestamp;
    } else if (typeof raw.timestamp === 'string') {
      const parsed = new Date(raw.timestamp);
      eventTime = isNaN(parsed.getTime()) ? new Date() : parsed;
    } else {
      eventTime = new Date();
    }

    return {
      deviceId: raw.deviceId,
      inspectionId: raw.inspectionId || undefined,
      timestamp: eventTime,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lon.toFixed(6)),
      speed: parseFloat(spd.toFixed(2)),
      accelerometerX: parseFloat(ax.toFixed(3)),
      accelerometerY: parseFloat(ay.toFixed(3)),
      accelerometerZ: parseFloat(az.toFixed(3)),
      gyroX: parseFloat(gx.toFixed(3)),
      gyroY: parseFloat(gy.toFixed(3)),
      gyroZ: parseFloat(gz.toFixed(3)),
      vibrationIntensity: parseFloat(vibration.toFixed(3)),
    };
  }
}

