import { z } from 'zod';
import { MediaType } from '@prisma/client';

export const presignMediaSchema = z.object({
  inspectionId: z.string().uuid('Valid inspection UUID required'),
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'Mime type is required'),
  sizeBytes: z.number().int().positive('Size must be positive'),
  type: z.nativeEnum(MediaType).default(MediaType.IMAGE),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  chainage: z.number().nonnegative().optional(),
});
