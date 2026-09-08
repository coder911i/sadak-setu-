import { z } from 'zod';
import { RoadStatus } from '@prisma/client';

export const createRoadSchema = z.object({
  roadCode: z.string().min(2, 'Road code is required'),
  name: z.string().min(2, 'Road name is required'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  block: z.string().optional(),
  village: z.string().optional(),
  lengthKm: z.number().positive('Length must be a positive number').default(1.0),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  routeGeoJson: z.any().optional(),
  status: z.nativeEnum(RoadStatus).optional().default(RoadStatus.OPERATIONAL),
});

export const updateRoadSchema = createRoadSchema.partial();

export const createSegmentSchema = z.object({
  segmentCode: z.string().min(1, 'Segment code is required'),
  chainageStart: z.number().min(0, 'Start chainage must be non-negative'),
  chainageEnd: z.number().positive('End chainage must be positive'),
  surfaceType: z.string().default('ASPHALT'),
  laneCount: z.number().int().min(1).default(2),
  geometry: z.any().optional(),
  status: z.nativeEnum(RoadStatus).optional().default(RoadStatus.OPERATIONAL),
});

export const roadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  state: z.string().optional(),
  district: z.string().optional(),
  status: z.nativeEnum(RoadStatus).optional(),
  search: z.string().optional(),
});
