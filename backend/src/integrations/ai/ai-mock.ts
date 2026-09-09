import { v4 as uuidv4 } from 'uuid';
import { DamageType, DamageSeverity, VerificationStatus } from '@prisma/client';

export interface AiDetectionResult {
  damageType: DamageType;
  confidence: number;
  severity: DamageSeverity;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  chainage?: number;
}

export interface AiAnalysisResponse {
  analysisId: string;
  source: string;
  mediaUrl: string;
  detections: AiDetectionResult[];
  inferenceTimeMs: number;
  metadata?: Record<string, any>;
}

export interface AiVerificationResponse {
  verificationId: string;
  result: VerificationStatus;
  confidence: number;
  reason: string;
  visualSimilarity: number;
  defectReduction: number;
  analysisTimeMs: number;
}

export class AiMockEngine {
  static analyzeImage(mediaUrl: string, lat?: number, lon?: number, chainage?: number): AiAnalysisResponse {
    // Generate realistic simulated detections based on image URL/hash
    const detections: AiDetectionResult[] = [
      {
        damageType: DamageType.POTHOLE,
        confidence: 0.92,
        severity: DamageSeverity.HIGH,
        boundingBox: { x: 140, y: 220, width: 110, height: 85 },
        location: lat && lon ? { latitude: lat, longitude: lon } : { latitude: 28.6139, longitude: 77.209 },
        chainage: chainage ?? 125.4,
      },
      {
        damageType: DamageType.CRACK,
        confidence: 0.84,
        severity: DamageSeverity.MEDIUM,
        boundingBox: { x: 300, y: 180, width: 180, height: 40 },
        location: lat && lon ? { latitude: lat + 0.0001, longitude: lon + 0.0001 } : { latitude: 28.614, longitude: 77.2091 },
        chainage: chainage ? chainage + 12.0 : 137.4,
      },
    ];

    return {
      analysisId: uuidv4(),
      source: 'MOCK_ENGINE',
      mediaUrl,
      detections,
      inferenceTimeMs: 145,
      metadata: {
        model: 'YOLOv8x-SadakSetu-RoadDefect-Prototype',
        framework: 'PyTorch/OpenCV',
        inputResolution: '1280x720',
      },
    };
  }

  static analyzeVideo(mediaUrl: string, lat?: number, lon?: number): AiAnalysisResponse {
    const detections: AiDetectionResult[] = [
      {
        damageType: DamageType.POTHOLE,
        confidence: 0.89,
        severity: DamageSeverity.CRITICAL,
        boundingBox: { x: 210, y: 310, width: 140, height: 95 },
        location: lat && lon ? { latitude: lat, longitude: lon } : { latitude: 28.615, longitude: 77.21 },
        chainage: 240.0,
      },
      {
        damageType: DamageType.SURFACE_DAMAGE,
        confidence: 0.78,
        severity: DamageSeverity.LOW,
        boundingBox: { x: 50, y: 400, width: 350, height: 120 },
        location: lat && lon ? { latitude: lat + 0.0003, longitude: lon + 0.0003 } : { latitude: 28.6153, longitude: 77.2103 },
        chainage: 280.5,
      },
    ];

    return {
      analysisId: uuidv4(),
      source: 'MOCK_ENGINE',
      mediaUrl,
      detections,
      inferenceTimeMs: 820,
      metadata: {
        model: 'YOLOv8-Video-Keyframe-Extractor',
        fpsSampled: 2,
        framesAnalyzed: 24,
      },
    };
  }

  static verifyBeforeAfter(beforeUrl: string, afterUrl: string): AiVerificationResponse {
    // Determine realistic simulated outcome
    const isSuccess = !afterUrl.includes('fail');
    if (isSuccess) {
      return {
        verificationId: uuidv4(),
        result: VerificationStatus.VERIFIED,
        confidence: 0.93,
        reason: 'Visual delta analysis indicates pothole depression has been filled and asphalt leveled to grade. Defect eradicated.',
        visualSimilarity: 0.88,
        defectReduction: 96.5,
        analysisTimeMs: 310,
      };
    } else {
      return {
        verificationId: uuidv4(),
        result: VerificationStatus.NOT_VERIFIED,
        confidence: 0.85,
        reason: 'Severe asphalt irregularities and perimeter cracking still detected in after-repair frame. Compaction standards unmet.',
        visualSimilarity: 0.62,
        defectReduction: 32.0,
        analysisTimeMs: 295,
      };
    }
  }
}
