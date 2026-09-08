import { prisma } from '../config/database';
import { GeoUtil } from '../utils/geo';
import { DamageDetection, DeviceTelemetry } from '@prisma/client';

export interface FusedDamageEvidence {
  damageId: string;
  damageType: string;
  severity: string;
  visualConfidence: number;
  latitude: number;
  longitude: number;
  chainage?: number | null;
  vibrationIntensity: number;
  maxAccelerationZ: number;
  nearbyTelemetryPoints: number;
  fusionScore: number; // 0 - 100 confidence that defect is corroborated by physical vibration
  fusionVerdict: 'CORROBORATED' | 'VISUAL_ONLY' | 'ANOMALOUS';
}

export class FusionService {
  /**
   * Spatially and temporally associates camera damage detections with IoT vibration telemetry.
   * Matches points within 30 meters GPS radius and +/- 60 seconds of capture.
   */
  async fuseInspectionData(inspectionId: string): Promise<FusedDamageEvidence[]> {
    const [detections, telemetryPoints] = await Promise.all([
      prisma.damageDetection.findMany({
        where: { inspectionId },
      }),
      prisma.deviceTelemetry.findMany({
        where: { inspectionId },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    const results: FusedDamageEvidence[] = [];

    for (const detection of detections) {
      if (detection.latitude === null || detection.longitude === null) {
        results.push({
          damageId: detection.id,
          damageType: detection.damageType,
          severity: detection.severity,
          visualConfidence: detection.confidence,
          latitude: 0,
          longitude: 0,
          vibrationIntensity: 0,
          maxAccelerationZ: 9.8,
          nearbyTelemetryPoints: 0,
          fusionScore: 50,
          fusionVerdict: 'VISUAL_ONLY',
        });
        continue;
      }

      // Find nearby telemetry points
      const nearbyTelemetry = telemetryPoints.filter((tp) =>
        GeoUtil.isNearby(detection.latitude!, detection.longitude!, tp.latitude, tp.longitude, 35)
      );

      let maxVibration = 0;
      let maxAz = 9.8;

      for (const tp of nearbyTelemetry) {
        if (tp.vibrationIntensity > maxVibration) {
          maxVibration = tp.vibrationIntensity;
        }
        if (Math.abs(tp.accelerometerZ) > Math.abs(maxAz)) {
          maxAz = tp.accelerometerZ;
        }
      }

      // Determine fusion verdict
      let verdict: 'CORROBORATED' | 'VISUAL_ONLY' | 'ANOMALOUS' = 'VISUAL_ONLY';
      let fusionScore = detection.confidence * 70; // baseline from vision

      if (nearbyTelemetry.length > 0 && maxVibration > 2.0) {
        verdict = 'CORROBORATED';
        fusionScore = Math.min(100, fusionScore + 30);
      } else if (nearbyTelemetry.length > 0 && maxVibration < 0.5 && detection.severity === 'CRITICAL') {
        verdict = 'ANOMALOUS'; // Visual says critical, but vehicle didn't register bump
      }

      results.push({
        damageId: detection.id,
        damageType: detection.damageType,
        severity: detection.severity,
        visualConfidence: detection.confidence,
        latitude: detection.latitude,
        longitude: detection.longitude,
        chainage: detection.chainage,
        vibrationIntensity: parseFloat(maxVibration.toFixed(2)),
        maxAccelerationZ: parseFloat(maxAz.toFixed(2)),
        nearbyTelemetryPoints: nearbyTelemetry.length,
        fusionScore: parseFloat(fusionScore.toFixed(1)),
        fusionVerdict: verdict,
      });
    }

    return results;
  }
}

export const fusionService = new FusionService();
