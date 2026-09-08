import { NormalizedTelemetry } from './device-adapter';

export class IotMockGenerator {
  static generateTelemetryStream(
    deviceId: string,
    startLat: number,
    startLon: number,
    count = 10,
    inspectionId?: string
  ): NormalizedTelemetry[] {
    const stream: NormalizedTelemetry[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const isAnomaly = i % 4 === 0; // Simulate bump / pothole vibration periodically
      const ax = isAnomaly ? 3.4 : 0.2;
      const ay = isAnomaly ? -2.8 : 0.1;
      const az = isAnomaly ? 14.5 : 9.8;
      const vibration = isAnomaly ? 5.2 : 0.3;

      stream.push({
        deviceId,
        inspectionId,
        timestamp: new Date(now + i * 1000),
        latitude: startLat + i * 0.0002,
        longitude: startLon + i * 0.0002,
        speed: 38.5 + (Math.random() * 4 - 2),
        accelerometerX: ax,
        accelerometerY: ay,
        accelerometerZ: az,
        gyroX: isAnomaly ? 1.2 : 0.05,
        gyroY: isAnomaly ? -1.8 : 0.02,
        gyroZ: isAnomaly ? 0.9 : 0.01,
        vibrationIntensity: vibration,
      });
    }

    return stream;
  }
}
