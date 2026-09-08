import { prisma } from '../config/database';
import { DamageDetection, DamageType, DamageSeverity, Prisma, RoadHealthScore } from '@prisma/client';

export class DamageRepository {
  async findById(id: string): Promise<DamageDetection | null> {
    return prisma.damageDetection.findUnique({
      where: { id },
      include: { inspection: { include: { road: true } }, mediaAsset: true },
    });
  }

  async create(data: Prisma.DamageDetectionCreateInput): Promise<DamageDetection> {
    return prisma.damageDetection.create({ data });
  }

  async createMany(data: Prisma.DamageDetectionCreateManyInput[]) {
    return prisma.damageDetection.createMany({ data });
  }

  async update(id: string, data: Prisma.DamageDetectionUpdateInput): Promise<DamageDetection> {
    return prisma.damageDetection.update({ where: { id }, data });
  }

  async findByInspectionId(inspectionId: string): Promise<DamageDetection[]> {
    return prisma.damageDetection.findMany({
      where: { inspectionId },
      include: { mediaAsset: true },
      orderBy: { chainage: 'asc' },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    damageType?: DamageType;
    severity?: DamageSeverity;
    roadId?: string;
  }): Promise<{ damages: DamageDetection[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DamageDetectionWhereInput = {
      ...(params.damageType && { damageType: params.damageType }),
      ...(params.severity && { severity: params.severity }),
      ...(params.roadId && { inspection: { roadId: params.roadId } }),
    };

    const [damages, total] = await Promise.all([
      prisma.damageDetection.findMany({
        where,
        skip,
        take: limit,
        include: {
          inspection: {
            select: {
              id: true,
              road: { select: { id: true, name: true, roadCode: true } },
            },
          },
          mediaAsset: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.damageDetection.count({ where }),
    ]);

    return { damages, total };
  }

  // Road Health Scores
  async createHealthScore(data: Prisma.RoadHealthScoreCreateInput): Promise<RoadHealthScore> {
    return prisma.roadHealthScore.create({ data });
  }

  async getLatestHealthScore(roadId: string): Promise<RoadHealthScore | null> {
    return prisma.roadHealthScore.findFirst({
      where: { roadId },
      orderBy: { calculatedAt: 'desc' },
    });
  }
}

export const damageRepository = new DamageRepository();
