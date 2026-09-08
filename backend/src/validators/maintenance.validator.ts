import { z } from 'zod';
import { PriorityLevel, MaintenanceStatus } from '@prisma/client';

export const createMaintenanceCaseSchema = z.object({
  roadId: z.string().uuid('Valid road UUID required'),
  segmentId: z.string().uuid().optional(),
  damageId: z.string().uuid().optional(),
  priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.HIGH),
  description: z.string().min(5, 'Description is required'),
  assignedTeamId: z.string().uuid().optional(),
  expectedCompletionDate: z.string().datetime().optional(),
});

export const updateMaintenanceCaseSchema = z.object({
  priority: z.nativeEnum(PriorityLevel).optional(),
  description: z.string().optional(),
  expectedCompletionDate: z.string().datetime().optional(),
});

export const assignTeamSchema = z.object({
  teamId: z.string().uuid('Valid team user UUID required'),
  expectedCompletionDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const submitRepairSchema = z.object({
  afterMediaUrl: z.string().url('After repair media URL required'),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const manualOverrideSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'RETURN_TO_TEAM']),
  reason: z.string().min(5, 'Reason for manual override is required'),
});

export const reopenCaseSchema = z.object({
  reason: z.string().min(5, 'Reason for reopening case is required'),
});

export const maintenanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  roadId: z.string().uuid().optional(),
  status: z.nativeEnum(MaintenanceStatus).optional(),
  priority: z.nativeEnum(PriorityLevel).optional(),
  teamId: z.string().uuid().optional(),
});
