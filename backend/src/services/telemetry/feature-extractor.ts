// src/services/telemetry/feature-extractor.ts

import { NormalizedTelemetry } from '../../integrations/iot/device-adapter';

/**
 * Computes basic magnitudes and ultrasonic difference from a normalized telemetry payload.
 */
export class FeatureExtractor {
  static computeMagnitudes(payload: NormalizedTelemetry) {
    const ax = Number.isFinite(payload.accelerometerX) ? payload.accelerometerX : 0.0;
    const ay = Number.isFinite(payload.accelerometerY) ? payload.accelerometerY : 0.0;
    const az = Number.isFinite(payload.accelerometerZ) ? payload.accelerometerZ : 0.0;
    const gx = Number.isFinite(payload.gyroX) ? payload.gyroX : 0.0;
    const gy = Number.isFinite(payload.gyroY) ? payload.gyroY : 0.0;
    const gz = Number.isFinite(payload.gyroZ) ? payload.gyroZ : 0.0;

    const aMag = Math.sqrt(ax ** 2 + ay ** 2 + az ** 2);
    const gMag = Math.sqrt(gx ** 2 + gy ** 2 + gz ** 2);
    return { accelerationMagnitude: aMag, gyroMagnitude: gMag };
  }

  /**
   * If the payload contains two ultrasonic distance readings (or distance_1 & distance_2),
   * compute the absolute difference.
   */
  static ultrasonicDiff(raw: any): number | null {
    if (!raw) return null;
    const u1 = raw.ultrasonic1 ?? raw.distance_1;
    const u2 = raw.ultrasonic2 ?? raw.distance_2;
    if (typeof u1 === 'number' && Number.isFinite(u1) && typeof u2 === 'number' && Number.isFinite(u2)) {
      return Math.abs(u1 - u2);
    }
    return null;
  }

  /**
   * Calculate statistical windowed features for an array of numeric values.
   * Returns a JSON object with the calculated statistics.
   */
  static windowStats(values: number[]) {
    const valid = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (valid.length === 0) return null;
    const sum = valid.reduce((a, b) => a + b, 0);
    const mean = sum / valid.length;
    const sorted = [...valid].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const peak = max;
    const variance = valid.reduce((a, b) => a + (b - mean) ** 2, 0) / valid.length;
    const stddev = Math.sqrt(variance);
    const rms = Math.sqrt(valid.reduce((a, b) => a + b ** 2, 0) / valid.length);
    return {
      mean: parseFloat(mean.toFixed(4)),
      median: parseFloat(median.toFixed(4)),
      min: parseFloat(min.toFixed(4)),
      max: parseFloat(max.toFixed(4)),
      peak: parseFloat(peak.toFixed(4)),
      variance: parseFloat(variance.toFixed(4)),
      stddev: parseFloat(stddev.toFixed(4)),
      rms: parseFloat(rms.toFixed(4)),
    };
  }

  /**
   * Full extraction pipeline for a single telemetry payload.
   * Returns an object suitable for persisting as TelemetryProcessed.
   */
  static extract(payload: NormalizedTelemetry, raw?: any) {
    const { accelerationMagnitude, gyroMagnitude } = this.computeMagnitudes(payload);
    const ultrasonicDiff = raw ? this.ultrasonicDiff(raw) : null;

    // Windowed feature set over accelerometer and acceleration magnitude
    const stats = this.windowStats([
      payload.accelerometerX,
      payload.accelerometerY,
      payload.accelerometerZ,
      accelerationMagnitude,
    ]);

    const windowStats = stats
      ? {
          ...stats,
          eventTimestamp: payload.timestamp.toISOString(),
          ingestedAt: new Date().toISOString(),
          gpsAvailable: payload.latitude !== 0.0 || payload.longitude !== 0.0,
        }
      : null;

    return {
      accelerationMagnitude: parseFloat(accelerationMagnitude.toFixed(4)),
      gyroMagnitude: parseFloat(gyroMagnitude.toFixed(4)),
      ultrasonicDiff: ultrasonicDiff !== null ? parseFloat(ultrasonicDiff.toFixed(2)) : null,
      windowStats,
    };
  }
}

