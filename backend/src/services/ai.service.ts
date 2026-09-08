import { aiClient } from '../integrations/ai/ai-client';
import { damageRepository } from '../repositories/damage.repository';
import { inspectionRepository } from '../repositories/inspection.repository';
import { auditRepository } from '../repositories/audit.repository';
import { PriorityEngine } from './priority.service';
import { InspectionStatus, DetectionSource } from '@prisma/client';

export class AiService {
  async analyzeImage(
    mediaUrl: string,
    inspectionId: string,
    mediaId?: string,
    lat?: number,
    lon?: number,
    chainage?: number,
    userId?: string
  ) {
    // 1. Validate inspection
    const inspection = await inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw { statusCode: 404, message: 'Inspection not found', code: 'INSPECTION_NOT_FOUND' };
    }

    // 2. Call AI service (Mock or Live Python microservice)
    const result = await aiClient.analyzeImage(mediaUrl, lat, lon, chainage);

    // 3. Persist detections
    const savedDetections = [];
    for (const det of result.detections) {
      const evaluation = PriorityEngine.evaluate({
        damageType: det.damageType,
        severity: det.severity,
        confidence: det.confidence,
        roadCode: inspection.road.roadCode,
      });

      const detection = await damageRepository.create({
        inspection: { connect: { id: inspectionId } },
        ...(mediaId && { mediaAsset: { connect: { id: mediaId } } }),
        damageType: det.damageType,
        severity: det.severity,
        confidence: det.confidence,
        boundingBox: det.boundingBox,
        latitude: det.location?.latitude ?? lat,
        longitude: det.location?.longitude ?? lon,
        chainage: det.chainage ?? chainage,
        source: DetectionSource.AI,
        notes: `AI Detection (${result.source}). Evaluated Priority: ${evaluation.priority}`,
      });

      savedDetections.push(detection);
    }

    // 4. Update inspection status if currently IN_PROGRESS
    if (inspection.status === InspectionStatus.IN_PROGRESS) {
      await inspectionRepository.update(inspectionId, { status: InspectionStatus.ANALYZING });
    }

    // 5. Audit log
    await auditRepository.log({
      userId,
      action: 'AI_IMAGE_ANALYZED',
      entity: 'Inspection',
      entityId: inspectionId,
      metadata: {
        analysisId: result.analysisId,
        source: result.source,
        detectionsCount: savedDetections.length,
        inferenceTimeMs: result.inferenceTimeMs,
      },
    });

    return {
      analysisId: result.analysisId,
      source: result.source,
      mediaUrl: result.mediaUrl,
      inferenceTimeMs: result.inferenceTimeMs,
      detections: savedDetections,
    };
  }

  async analyzeVideo(mediaUrl: string, inspectionId: string, lat?: number, lon?: number, userId?: string) {
    const inspection = await inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw { statusCode: 404, message: 'Inspection not found', code: 'INSPECTION_NOT_FOUND' };
    }

    const result = await aiClient.analyzeVideo(mediaUrl, lat, lon);

    const savedDetections = [];
    for (const det of result.detections) {
      const detection = await damageRepository.create({
        inspection: { connect: { id: inspectionId } },
        damageType: det.damageType,
        severity: det.severity,
        confidence: det.confidence,
        boundingBox: det.boundingBox,
        latitude: det.location?.latitude ?? lat,
        longitude: det.location?.longitude ?? lon,
        chainage: det.chainage,
        source: DetectionSource.AI,
      });
      savedDetections.push(detection);
    }

    await auditRepository.log({
      userId,
      action: 'AI_VIDEO_ANALYZED',
      entity: 'Inspection',
      entityId: inspectionId,
      metadata: {
        analysisId: result.analysisId,
        detectionsCount: savedDetections.length,
      },
    });

    return {
      analysisId: result.analysisId,
      source: result.source,
      detections: savedDetections,
    };
  }

  async correctDamageDetection(
    damageId: string,
    correction: {
      damageType?: any;
      severity?: any;
      notes?: string;
    },
    userId: string
  ) {
    const existing = await damageRepository.findById(damageId);
    if (!existing) {
      throw { statusCode: 404, message: 'Damage detection not found', code: 'DAMAGE_NOT_FOUND' };
    }

    const updated = await damageRepository.update(damageId, {
      ...(correction.damageType && { damageType: correction.damageType }),
      ...(correction.severity && { severity: correction.severity }),
      isCorrected: true,
      correctedBy: userId,
      correctedAt: new Date(),
      notes: correction.notes || existing.notes,
    });

    await auditRepository.log({
      userId,
      action: 'DAMAGE_DETECTION_CORRECTED',
      entity: 'DamageDetection',
      entityId: damageId,
      metadata: {
        previous: { type: existing.damageType, severity: existing.severity },
        updated: { type: updated.damageType, severity: updated.severity },
      },
    });

    return updated;
  }
}

export const aiService = new AiService();
