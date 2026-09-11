/**
 * Sensor ML Service for Sadak Setu
 * 
 * This service integrates sensor-based ML predictions with automatic complaint creation,
 * duplicate detection, and realtime event emission for road anomaly detection.
 */

import { sensorMLClient, SensorInferenceRequest, SensorInferenceResponse } from '../integrations/ai/sensor-client';
import { maintenanceRepository } from '../repositories/maintenance.repository';
import { auditRepository } from '../repositories/audit.repository';
import { roadRepository } from '../repositories/road.repository';
import { config } from '../config';
import { prisma } from '../config/database';
import { PriorityLevel, MaintenanceStatus, DetectionSource } from '@prisma/client';
import { logger } from '../utils/logger';

export interface ComplaintCreationRequest {
  device_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  event_type: string;
  severity: string | null;
  estimated_depth_cm: number | null;
  confidence: number;
  model_version: string;
}

export interface DuplicateDetectionResult {
  is_duplicate: boolean;
  existing_complaint_id?: string;
  distance_meters?: number;
  time_difference_seconds?: number;
}

export class SensorMLService {
  /**
   * Process sensor telemetry and create complaints if anomalies are detected
   */
  async processSensorTelemetry(request: SensorInferenceRequest): Promise<SensorInferenceResponse> {
    try {
      // Get ML prediction
      const prediction = await sensorMLClient.predictAnomaly(request);
      
      logger.info('Sensor ML prediction received', {
        device_id: prediction.device_id,
        event_type: prediction.event_type,
        confidence: prediction.confidence
      });

      // Check if automatic complaint creation should be triggered
      if (sensorMLClient.shouldCreateComplaint(prediction)) {
        await this.handlePotentialComplaint(prediction);
      }

      return prediction;
    } catch (error) {
      logger.error('Sensor ML processing failed', error);
      throw error;
    }
  }

  /**
   * Handle potential complaint creation from ML prediction
   */
  private async handlePotentialComplaint(prediction: SensorInferenceResponse): Promise<void> {
    try {
      // Check for duplicates
      const duplicateCheck = await this.checkForDuplicates(prediction);
      
      if (duplicateCheck.is_duplicate) {
        logger.info('Duplicate pothole detected, skipping complaint creation', {
          existing_complaint_id: duplicateCheck.existing_complaint_id,
          distance_meters: duplicateCheck.distance_meters
        });
        return;
      }

      // Create maintenance case
      const complaint = await this.createComplaintFromPrediction(prediction);
      
      logger.info('Automatic complaint created from sensor ML', {
        complaint_id: complaint.id,
        case_number: complaint.caseNumber,
        event_type: prediction.event_type,
        severity: prediction.severity
      });

      // Emit realtime event (placeholder - will be implemented with WebSocket/SSE)
      await this.emitRealtimeEvent(complaint, prediction);

    } catch (error) {
      logger.error('Failed to handle potential complaint', error);
      // Don't throw - we don't want to break the telemetry pipeline
    }
  }

  /**
   * Check for duplicate complaints using spatial-temporal deduplication
   */
  private async checkForDuplicates(
    prediction: SensorInferenceResponse
  ): Promise<DuplicateDetectionResult> {
    const dedupRadius = config.sensor.dedupRadiusMeters;
    const dedupWindow = config.sensor.dedupWindowSeconds;

    // Find recent complaints within spatial and temporal window
    const timeThreshold = new Date(Date.now() - dedupWindow * 1000);
    
    const recentComplaints = await prisma.maintenanceCase.findMany({
      where: {
        status: {
          in: [MaintenanceStatus.OPEN, MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS]
        },
        createdAt: {
          gte: timeThreshold
        },
        source: DetectionSource.SENSOR // Only check sensor-generated complaints
      },
      include: {
        damage: true
      }
    });

    // Check spatial proximity
    for (const complaint of recentComplaints) {
      if (!complaint.damage?.latitude || !complaint.damage?.longitude) {
        continue;
      }

      const distance = this.calculateDistance(
        prediction.latitude,
        prediction.longitude,
        complaint.damage.latitude,
        complaint.damage.longitude
      );

      if (distance <= dedupRadius) {
        return {
          is_duplicate: true,
          existing_complaint_id: complaint.id,
          distance_meters: distance,
          time_difference_seconds: Math.abs(
            new Date(prediction.timestamp).getTime() - complaint.createdAt.getTime()
          ) / 1000
        };
      }
    }

    return { is_duplicate: false };
  }

  /**
   * Calculate Haversine distance between two GPS coordinates
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Create maintenance case from ML prediction
   */
  private async createComplaintFromPrediction(
    prediction: SensorInferenceResponse
  ) {
    // Find nearest road (simplified - in production, use proper spatial query)
    const nearestRoad = await this.findNearestRoad(
      prediction.latitude,
      prediction.longitude
    );

    if (!nearestRoad) {
      logger.warn('No road found near detected pothole', {
        latitude: prediction.latitude,
        longitude: prediction.longitude
      });
      throw new Error('No road found near detected pothole');
    }

    // Determine priority based on severity
    const priority = this.determinePriority(prediction.severity);

    // Generate case number
    const caseNumber = await this.generateCaseNumber();

    // Create maintenance case
    const complaint = await maintenanceRepository.create({
      caseNumber,
      roadId: nearestRoad.id,
      priority,
      priorityScore: this.calculatePriorityScore(prediction),
      priorityReason: `AI-generated from sensor ML. Severity: ${prediction.severity}, Confidence: ${prediction.confidence.toFixed(2)}`,
      status: MaintenanceStatus.OPEN,
      description: this.generateComplaintDescription(prediction),
      createdById: 'SYSTEM_AI', // System-generated
      // Add ML-specific metadata
      notes: JSON.stringify({
        source: 'AI_IOT',
        device_id: prediction.device_id,
        model_version: prediction.model_version,
        confidence: prediction.confidence,
        estimated_depth_cm: prediction.estimated_depth_cm,
        detected_at: prediction.timestamp
      })
    });

    // Create damage detection record
    await prisma.damageDetection.create({
      data: {
        inspectionId: null, // Not associated with specific inspection
        damageType: prediction.event_type === 'SEVERE_POTHOLE' ? 'POTHOLE' : 'POTHOLE',
        severity: prediction.severity || 'MEDIUM',
        confidence: prediction.confidence,
        latitude: prediction.latitude,
        longitude: prediction.longitude,
        source: DetectionSource.SENSOR,
        notes: `AI-generated from device ${prediction.device_id} using model ${prediction.model_version}`
      }
    });

    // Audit log
    await auditRepository.log({
      userId: 'SYSTEM_AI',
      action: 'AUTO_COMPLAINT_CREATED',
      entity: 'MaintenanceCase',
      entityId: complaint.id,
      metadata: {
        source: 'SENSOR_ML',
        device_id: prediction.device_id,
        event_type: prediction.event_type,
        confidence: prediction.confidence,
        model_version: prediction.model_version
      }
    });

    return complaint;
  }

  /**
   * Find nearest road to GPS coordinates
   */
  private async findNearestRoad(latitude: number, longitude: number) {
    // Simplified - find nearest road by distance
    // In production, use PostGIS spatial queries
    const roads = await prisma.road.findMany({
      take: 10,
      where: {
        status: 'OPERATIONAL'
      }
    });

    let nearestRoad = null;
    let minDistance = Infinity;

    for (const road of roads) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        road.latitude,
        road.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestRoad = road;
      }
    }

    // Only return if within reasonable distance (5 km)
    if (minDistance < 5000) {
      return nearestRoad;
    }

    return null;
  }

  /**
   * Determine priority level from severity
   */
  private determinePriority(severity: string | null): PriorityLevel {
    switch (severity) {
      case 'CRITICAL':
        return PriorityLevel.IMMEDIATE;
      case 'HIGH':
        return PriorityLevel.HIGH;
      case 'MEDIUM':
        return PriorityLevel.HIGH;
      case 'LOW':
        return PriorityLevel.MONITOR;
      default:
        return PriorityLevel.HIGH;
    }
  }

  /**
   * Calculate priority score for sorting
   */
  private calculatePriorityScore(prediction: SensorInferenceResponse): number {
    let score = 50; // Base score

    // Adjust based on severity
    switch (prediction.severity) {
      case 'CRITICAL':
        score += 30;
        break;
      case 'HIGH':
        score += 20;
        break;
      case 'MEDIUM':
        score += 10;
        break;
      case 'LOW':
        score += 5;
        break;
    }

    // Adjust based on confidence
    score += prediction.confidence * 10;

    // Adjust based on depth
    if (prediction.estimated_depth_cm) {
      score += Math.min(prediction.estimated_depth_cm, 10);
    }

    return Math.min(score, 100);
  }

  /**
   * Generate complaint description
   */
  private generateComplaintDescription(prediction: SensorInferenceResponse): string {
    const severityText = prediction.severity || 'unknown';
    const depthText = prediction.estimated_depth_cm 
      ? `Estimated depth: ${prediction.estimated_depth_cm.toFixed(1)} cm`
      : 'Depth not estimated';
    
    return `AI-detected ${prediction.event_type} (${severityText} severity). ${depthText}. ` +
           `Confidence: ${(prediction.confidence * 100).toFixed(1)}%. ` +
           `Detected by device ${prediction.device_id} at ${prediction.timestamp}. ` +
           `Model version: ${prediction.model_version}.`;
  }

  /**
   * Generate unique case number
   */
  private async generateCaseNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Count existing cases for this month
    const count = await prisma.maintenanceCase.count({
      where: {
        createdAt: {
          gte: new Date(year, date.getMonth(), 1),
          lt: new Date(year, date.getMonth() + 1, 1)
        }
      }
    });

    return `SS-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Emit realtime event (placeholder for WebSocket/SSE implementation)
   */
  private async emitRealtimeEvent(complaint: any, prediction: SensorInferenceResponse): Promise<void> {
    // TODO: Implement WebSocket/SSE emission
    // This will be implemented in Phase 8 when we add realtime support
    logger.info('Realtime event emission (placeholder)', {
      complaint_id: complaint.id,
      event_type: prediction.event_type
    });
  }

  /**
   * Health check for sensor ML service
   */
  async healthCheck() {
    return await sensorMLClient.healthCheck();
  }
}

export const sensorMLService = new SensorMLService();