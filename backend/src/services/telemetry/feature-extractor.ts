// src/services/telemetry/feature-extractor.ts

import { NormalizedTelemetry } from '../../integrations/iot/device-adapter';
import { IntelligenceConfig } from '../../config/intelligence';

/**
 * Computes basic magnitudes and ultrasonic difference from a normalized telemetry payload.
 */
export class FeatureExtractor {
  static computeMagnitudes(payload: NormalizedTelemetry) {
    const aMag = Math.sqrt(
      payload.accelerometerX ** 2 +
        payload.accelerometerY ** 2 +
        payload.accelerometerZ ** 2,
    );
    const gMag = Math.sqrt(
      payload.gyroX ** 2 + payload.gyroY ** 2 + payload.gyroZ ** 2,
    );
    return { accelerationMagnitude: aMag, gyroMagnitude: gMag };
  }

  /**
   * If the payload contains two ultrasonic distance readings, compute the absolute difference.
   * The RawTelemetry may include `ultrasonic1` and `ultrasonic2` – they are optional in the adapter.
   */
  static ultrasonicDiff(raw: any): number | null {
    if (typeof raw.ultrasonic1 === 'number' && typeof raw.ultrasonic2 === 'number') {
      return Math.abs(raw.ultrasonic1 - raw.ultrasonic2);
    }
    return null;
  }

  /**
   * Calculate statistical windowed features for an array of numeric values.
   * Returns a JSON object with the requested statistics.
   */
  static windowStats(values: number[]) {
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const peak = max;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);
    const rms = Math.sqrt(values.reduce((a, b) => a + b ** 2, 0) / values.length);
    return {
      mean,
      median,
      min,
      max,
      peak,
      variance,
      stddev,
      rms,
    };
  }

  /**
   * Full extraction pipeline for a single telemetry payload.
   * Returns an object suitable for persisting as TelemetryProcessed.
   */
  static extract(payload: NormalizedTelemetry, raw?: any) {
    const { accelerationMagnitude, gyroMagnitude } = this.computeMagnitudes(payload);
    const ultrasonicDiff = raw ? this.ultrasonicDiff(raw) : null;
    // For windowed stats we would normally batch over time – placeholder empty array for now.
    const windowStats = null;
    return {
      accelerationMagnitude,
      gyroMagnitude,
      ultrasonicDiff,
      windowStats,
    };
  }
}
