import { z } from 'zod';

export const calculateScoreSchema = z.object({
  roadId: z.string().uuid('Valid road UUID required'),
  segmentId: z.string().uuid().optional(),
  weights: z
    .object({
      severity: z.number().min(0).max(1).optional(),
      density: z.number().min(0).max(1).optional(),
      vibration: z.number().min(0).max(1).optional(),
      location: z.number().min(0).max(1).optional(),
    })
    .optional(),
});
