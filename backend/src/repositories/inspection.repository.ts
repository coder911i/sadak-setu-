import { prisma } from '../config/database';
import { Inspection, InspectionStatus, Prisma, MediaAsset } from '@prisma/client';

export class InspectionRepository {
  async findById(id: string) {
    return prisma.inspection.findUnique({
      where: { id },
      include: {
        road: true,
        inspector: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        mediaAssets: true,
        detections: true,
      },
    });
  }

  async create(data: Prisma.InspectionCreateInput): Promise<Inspection> {
    return prisma.inspection.create({
      data,
      include: {
        road: true,
        inspector: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.InspectionUpdateInput): Promise<Inspection> {
    return prisma.inspection.update({
      where: { id },
      data,
      include: { road: true },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    roadId?: string;
    inspectorId?: string;
    status?: InspectionStatus;
  }): Promise<{ inspections: Inspection[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InspectionWhereInput = {
      ...(params.roadId && { roadId: params.roadId }),
      ...(params.inspectorId && { inspectorId: params.inspectorId }),
      ...(params.status && { status: params.status }),
    };

    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        skip,
        take: limit,
        include: {
          road: { select: { id: true, name: true, roadCode: true } },
          inspector: { select: { id: true, fullName: true, email: true } },
          _count: {
            select: {
              mediaAssets: true,
              detections: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inspection.count({ where }),
    ]);

    return { inspections, total };
  }

  // Media
  async createMediaAsset(data: Prisma.MediaAssetCreateInput): Promise<MediaAsset> {
    return prisma.mediaAsset.create({ data });
  }

  async findMediaById(id: string): Promise<MediaAsset | null> {
    return prisma.mediaAsset.findUnique({ where: { id } });
  }

  async deleteMedia(id: string): Promise<MediaAsset> {
    return prisma.mediaAsset.delete({ where: { id } });
  }
}

export const inspectionRepository = new InspectionRepository();
