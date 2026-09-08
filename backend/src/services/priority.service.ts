import { PriorityLevel, DamageSeverity } from '@prisma/client';

export interface PriorityEvaluationInput {
  damageType: string;
  severity: DamageSeverity;
  confidence: number;
  vibrationIntensity?: number;
  roadCode?: string;
  roadHealthScore?: number;
}

export interface PriorityEvaluationResult {
  priority: PriorityLevel;
  priorityScore: number; // 0 - 100
  reason: string;
  recommendedAction: string;
}

export class PriorityEngine {
  /**
   * Deterministic decision engine classifying maintenance urgency with transparent reasoning.
   */
  static evaluate(input: PriorityEvaluationInput): PriorityEvaluationResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Severity Base
    switch (input.severity) {
      case DamageSeverity.CRITICAL:
        score += 50;
        reasons.push('Critical defect posing imminent vehicular damage or hazard');
        break;
      case DamageSeverity.HIGH:
        score += 35;
        reasons.push('High-severity surface deterioration');
        break;
      case DamageSeverity.MEDIUM:
        score += 20;
        reasons.push('Moderate surface defect');
        break;
      case DamageSeverity.LOW:
        score += 10;
        reasons.push('Minor surface flaw');
        break;
    }

    // 2. Vibration / Physical impact
    if (input.vibrationIntensity && input.vibrationIntensity > 3.0) {
      score += 25;
      reasons.push(`High vehicle vibration evidence detected (${input.vibrationIntensity}G)`);
    } else if (input.vibrationIntensity && input.vibrationIntensity > 1.5) {
      score += 12;
      reasons.push(`Moderate physical vehicle impact corroborated`);
    }

    // 3. Road Hierarchy Importance
    if (input.roadCode?.startsWith('NH')) {
      score += 20;
      reasons.push('National Highway arterial corridor high-speed route');
    } else if (input.roadCode?.startsWith('SH')) {
      score += 12;
      reasons.push('State Highway secondary corridor');
    }

    // 4. Low Overall Health Score Escalation
    if (input.roadHealthScore !== undefined && input.roadHealthScore < 40) {
      score += 15;
      reasons.push(`Road health is critically degraded (Score: ${input.roadHealthScore})`);
    }

    // Normalize score to 0 - 100
    const finalScore = Math.min(100, score);

    let priority: PriorityLevel = PriorityLevel.MONITOR;
    let recommendedAction = 'Continue routine monitoring at next scheduled survey.';

    if (finalScore >= 75 || input.severity === DamageSeverity.CRITICAL) {
      priority = PriorityLevel.IMMEDIATE;
      recommendedAction = 'Dispatch maintenance crew within 24 hours for emergency patching and barricading.';
    } else if (finalScore >= 45 || input.severity === DamageSeverity.HIGH) {
      priority = PriorityLevel.HIGH;
      recommendedAction = 'Schedule asphalt repair and cold-mix filling within 7 days.';
    }

    return {
      priority,
      priorityScore: finalScore,
      reason: reasons.join('. ') + '.',
      recommendedAction,
    };
  }
}
