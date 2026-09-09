import { prisma } from '../config/database';
import { config } from '../config';
import { DamageSeverity } from '@prisma/client';

export interface ScoringWeights {
  severity: number;
  density: number;
  vibration: number;
  location: number;
}

export class HealthScoreService {
  /**
   * Calculates Road Health Score (0 - 100).
   * 100 = Pristine condition.
   * 0 = Severe structural failure requiring total reconstruction.
   *
   * Degradation Score = (W_sev * SeverityIndex) + (W_den * DensityIndex) + (W_vib * VibrationIndex) + (W_loc * LocationIndex)
   * Road Health Score = Math.max(0, 100 - DegradationScore)
   */
  async calculateRoadHealth(
    roadId: string,
    segmentId?: string,
    customWeights?: Partial<ScoringWeights>
  ) {
    const weights: ScoringWeights = {
      severity: customWeights?.severity ?? config.scoringWeights.severity,
      density: customWeights?.density ?? config.scoringWeights.density,
      vibration: customWeights?.vibration ?? config.scoringWeights.vibration,
      location: customWeights?.location ?? config.scoringWeights.location,
    };

    // 1. Fetch road and all detections
    const road = await prisma.road.findUniqueOrThrow({
      where: { id: roadId },
      include: {
        inspections: {
          include: {
            detections: true,
            telemetry: true,
          },
        },
      },
    });

    const allDetections = road.inspections.flatMap((i) => i.detections);
    const allTelemetry = road.inspections.flatMap((i) => i.telemetry);

    // 2. Severity Index (0 - 100)
    let totalSeverityScore = 0;
    for (const d of allDetections) {
      switch (d.severity) {
        case DamageSeverity.CRITICAL:
          totalSeverityScore += 35;
          break;
        case DamageSeverity.HIGH:
          totalSeverityScore += 20;
          break;
        case DamageSeverity.MEDIUM:
          totalSeverityScore += 10;
          break;
        case DamageSeverity.LOW:
          totalSeverityScore += 4;
          break;
      }
    }
    const severityIndex = Math.min(100, totalSeverityScore);

    // 3. Density Index (Detections per km) (0 - 100)
    const roadLengthKm = Math.max(0.5, road.lengthKm);
    const defectDensity = allDetections.length / roadLengthKm;
    const densityIndex = Math.min(100, defectDensity * 12);

    // 4. Vibration Index (from IoT accelerometer anomalies) (0 - 100)
    let vibrationIndex = 0;
    if (allTelemetry.length > 0) {
      const avgVibration =
        allTelemetry.reduce((acc, t) => acc + t.vibrationIntensity, 0) / allTelemetry.length;
      vibrationIndex = Math.min(100, avgVibration * 18);
    }

    // 5. Location / Route factor (Traffic importance: NH > SH > Village)
    let locationFactor = 10;
    if (road.roadCode.startsWith('NH')) {
      locationFactor = 25; // National highways have higher penalty weight for defects
    } else if (road.roadCode.startsWith('SH')) {
      locationFactor = 18;
    }

    // 6. Compute degradation penalty
    const totalWeights = weights.severity + weights.density + weights.vibration + weights.location;
    const normalizedDegradation =
      (weights.severity * severityIndex +
        weights.density * densityIndex +
        weights.vibration * vibrationIndex +
        weights.location * locationFactor) /
      (totalWeights || 1.0);

    const finalScore = parseFloat(Math.max(0, Math.min(100, 100 - normalizedDegradation)).toFixed(1));

    // 7. Persist health score record
    const healthRecord = await prisma.roadHealthScore.create({
      data: {
        roadId,
        segmentId,
        score: finalScore,
        severityIndex: parseFloat(severityIndex.toFixed(1)),
        densityIndex: parseFloat(densityIndex.toFixed(1)),
        vibrationIndex: parseFloat(vibrationIndex.toFixed(1)),
        locationIndex: parseFloat(locationFactor.toFixed(1)),
        formulaVersion: '1.0.0-prototype',
        details: {
          weightsUsed: {
            severity: weights.severity,
            density: weights.density,
            vibration: weights.vibration,
            location: weights.location,
          },
          totalDefects: allDetections.length,
          densityPerKm: parseFloat(defectDensity.toFixed(2)),
          telemetrySamples: allTelemetry.length,
        } as any,
      },
    });

    return healthRecord;
  }

  async getLatestRoadHealth(roadId: string) {
    const score = await prisma.roadHealthScore.findFirst({
      where: { roadId },
      orderBy: { calculatedAt: 'desc' },
      include: { road: { select: { id: true, name: true, roadCode: true, lengthKm: true } } },
    });

    if (!score) {
      // Calculate initial baseline if none exists
      return this.calculateRoadHealth(roadId);
    }

    return score;
  }
}

export const healthScoreService = new HealthScoreService();
