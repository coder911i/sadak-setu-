import { prisma } from '../config/database';
import { Road, RoadSegment, RoadStatus, Prisma } from '@prisma/client';

export interface RoadQueryParams {
  page?: number;
  limit?: number;
  state?: string;
  district?: string;
  status?: RoadStatus;
  search?: string;
}

export class RoadRepository {
  async findById(id: string): Promise<Road | null> {
    return prisma.road.findUnique({
      where: { id },
      include: {
        segments: true,
        healthScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findByCode(roadCode: string): Promise<Road | null> {
    return prisma.road.findUnique({ where: { roadCode } });
  }

  async create(data: Prisma.RoadCreateInput): Promise<Road> {
    return prisma.road.create({ data });
  }

  async update(id: string, data: Prisma.RoadUpdateInput): Promise<Road> {
    return prisma.road.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Road> {
    return prisma.road.delete({ where: { id } });
  }

  async findAll(params: RoadQueryParams): Promise<{ roads: Road[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.RoadWhereInput = {
      ...(params.state && { state: { contains: params.state, mode: 'insensitive' } }),
      ...(params.district && { district: { contains: params.district, mode: 'insensitive' } }),
      ...(params.status && { status: params.status }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { roadCode: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [roads, total] = await Promise.all([
      prisma.road.findMany({
        where,
        skip,
        take: limit,
        include: {
          healthScores: {
            orderBy: { calculatedAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              inspections: true,
              maintenanceCases: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.road.count({ where }),
    ]);

    return { roads, total };
  }

  // Segments
  async findSegmentsByRoadId(roadId: string): Promise<RoadSegment[]> {
    return prisma.roadSegment.findMany({
      where: { roadId },
      orderBy: { chainageStart: 'asc' },
    });
  }

  async createSegment(data: Prisma.RoadSegmentCreateInput): Promise<RoadSegment> {
    return prisma.roadSegment.create({ data });
  }
}

export const roadRepository = new RoadRepository();
