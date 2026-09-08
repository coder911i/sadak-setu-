import { describe, it, expect } from 'vitest';
import { PriorityEngine } from '../../src/services/priority.service';
import { DamageSeverity, PriorityLevel } from '@prisma/client';

describe('PriorityEngine Unit Tests', () => {
  it('should evaluate CRITICAL pothole with high vibration as IMMEDIATE priority', () => {
    const result = PriorityEngine.evaluate({
      damageType: 'POTHOLE',
      severity: DamageSeverity.CRITICAL,
      confidence: 0.95,
      vibrationIntensity: 4.8,
      roadCode: 'NH-19-UP-04',
      roadHealthScore: 35,
    });

    expect(result.priority).toBe(PriorityLevel.IMMEDIATE);
    expect(result.priorityScore).toBeGreaterThanOrEqual(75);
    expect(result.reason).toContain('Critical defect');
    expect(result.reason).toContain('High vehicle vibration');
    expect(result.recommendedAction).toContain('24 hours');
  });

  it('should evaluate HIGH severity crack on National Highway as HIGH or IMMEDIATE priority', () => {
    const result = PriorityEngine.evaluate({
      damageType: 'CRACK',
      severity: DamageSeverity.HIGH,
      confidence: 0.88,
      roadCode: 'NH-05-HP-12',
    });

    expect([PriorityLevel.HIGH, PriorityLevel.IMMEDIATE]).toContain(result.priority);
    expect(result.priorityScore).toBeGreaterThanOrEqual(45);
  });

  it('should evaluate LOW severity surface flaw with no vibration as MONITOR', () => {
    const result = PriorityEngine.evaluate({
      damageType: 'SURFACE_DAMAGE',
      severity: DamageSeverity.LOW,
      confidence: 0.65,
      vibrationIntensity: 0.2,
      roadCode: 'VR-01-UP',
    });

    expect(result.priority).toBe(PriorityLevel.MONITOR);
    expect(result.priorityScore).toBeLessThan(45);
    expect(result.recommendedAction).toContain('routine monitoring');
  });
});
