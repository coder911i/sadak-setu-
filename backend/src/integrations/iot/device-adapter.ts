export interface RawTelemetryPayload {
  deviceId: string;
  inspectionId?: string;
  timestamp?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  accelerometerX?: number;
  accelerometerY?: number;
  accelerometerZ?: number;
  gyroX?: number;
  gyroY?: number;
  gyroZ?: number;
  vibrationIntensity?: number;
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
   * Computes Root-Mean-Square (RMS) vibration vector magnitude if not directly supplied.
   */
  static normalize(raw: RawTelemetryPayload): NormalizedTelemetry {
    const ax = raw.accelerometerX ?? 0.0;
    const ay = raw.accelerometerY ?? 0.0;
    const az = raw.accelerometerZ ?? 0.0;

    // Calculate dynamic vibration intensity (deviation from gravity 1G / 9.8 m/s^2)
    const totalG = Math.sqrt(ax * ax + ay * ay + az * az);
    const vibration = raw.vibrationIntensity ?? Math.max(0, Math.abs(totalG - 9.8));

    return {
      deviceId: raw.deviceId,
      inspectionId: raw.inspectionId,
      timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
      latitude: raw.latitude,
      longitude: raw.longitude,
      speed: raw.speed ?? 0.0,
      accelerometerX: ax,
      accelerometerY: ay,
      accelerometerZ: az,
      gyroX: raw.gyroX ?? 0.0,
      gyroY: raw.gyroY ?? 0.0,
      gyroZ: raw.gyroZ ?? 0.0,
      vibrationIntensity: parseFloat(vibration.toFixed(3)),
    };
  }
}
