import { z } from 'zod';
import { InspectionType, InspectionStatus } from '@prisma/client';

export const createInspectionSchema = z.object({
  roadId: z.string().uuid('Valid road UUID required'),
  inspectionType: z.nativeEnum(InspectionType).optional().default(InspectionType.ROUTINE_SURVEY),
  remarks: z.string().optional(),
});

export const updateInspectionSchema = z.object({
  status: z.nativeEnum(InspectionStatus).optional(),
  totalDistanceMeters: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
});

export const completeInspectionSchema = z.object({
  totalDistanceMeters: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
});

export const inspectionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  roadId: z.string().uuid().optional(),
  inspectorId: z.string().uuid().optional(),
  status: z.nativeEnum(InspectionStatus).optional(),
});
