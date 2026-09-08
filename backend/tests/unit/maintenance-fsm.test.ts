import { describe, it, expect } from 'vitest';
import { MaintenanceStatus } from '@prisma/client';

describe('Maintenance Finite State Machine Logic', () => {
  const VALID_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
    [MaintenanceStatus.OPEN]: [MaintenanceStatus.ASSIGNED, MaintenanceStatus.CLOSED],
    [MaintenanceStatus.ASSIGNED]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.ASSIGNED],
    [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.REPAIR_SUBMITTED, MaintenanceStatus.RETURNED_TO_TEAM],
    [MaintenanceStatus.REPAIR_SUBMITTED]: [MaintenanceStatus.AI_VERIFICATION],
    [MaintenanceStatus.AI_VERIFICATION]: [
      MaintenanceStatus.VERIFIED,
      MaintenanceStatus.RETURNED_TO_TEAM,
      MaintenanceStatus.IN_PROGRESS,
    ],
    [MaintenanceStatus.VERIFIED]: [MaintenanceStatus.CLOSED, MaintenanceStatus.REOPENED],
    [MaintenanceStatus.RETURNED_TO_TEAM]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.REOPENED],
    [MaintenanceStatus.REOPENED]: [MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS],
    [MaintenanceStatus.CLOSED]: [MaintenanceStatus.REOPENED],
  };

  const isTransitionAllowed = (from: MaintenanceStatus, to: MaintenanceStatus): boolean => {
    return (VALID_TRANSITIONS[from] || []).includes(to);
  };

  it('should allow valid happy path transitions', () => {
    expect(isTransitionAllowed(MaintenanceStatus.OPEN, MaintenanceStatus.ASSIGNED)).toBe(true);
    expect(isTransitionAllowed(MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS)).toBe(true);
    expect(isTransitionAllowed(MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.REPAIR_SUBMITTED)).toBe(true);
    expect(isTransitionAllowed(MaintenanceStatus.REPAIR_SUBMITTED, MaintenanceStatus.AI_VERIFICATION)).toBe(true);
    expect(isTransitionAllowed(MaintenanceStatus.AI_VERIFICATION, MaintenanceStatus.VERIFIED)).toBe(true);
    expect(isTransitionAllowed(MaintenanceStatus.VERIFIED, MaintenanceStatus.CLOSED)).toBe(true);
  });

  it('should allow failure loop: AI_VERIFICATION -> RETURNED_TO_TEAM -> IN_PROGRESS', () => {
    expect(isTransitionAllowed(MaintenanceStatus.AI_VERIFICATION, MaintenanceStatus.RETURNED_TO_TEAM)).toBe(true);
    expect(isTransitionAllowed(MaintenanceStatus.RETURNED_TO_TEAM, MaintenanceStatus.IN_PROGRESS)).toBe(true);
  });

  it('should reject illegal state jumps', () => {
    // Cannot jump from OPEN directly to VERIFIED or CLOSED without inspection/repair
    expect(isTransitionAllowed(MaintenanceStatus.OPEN, MaintenanceStatus.VERIFIED)).toBe(false);
    expect(isTransitionAllowed(MaintenanceStatus.OPEN, MaintenanceStatus.REPAIR_SUBMITTED)).toBe(false);
    expect(isTransitionAllowed(MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.VERIFIED)).toBe(false);
    expect(isTransitionAllowed(MaintenanceStatus.REPAIR_SUBMITTED, MaintenanceStatus.CLOSED)).toBe(false);
  });
});
