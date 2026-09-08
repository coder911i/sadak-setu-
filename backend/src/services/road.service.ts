import { roadRepository, RoadQueryParams } from '../repositories/road.repository';
import { auditRepository } from '../repositories/audit.repository';
import { prisma } from '../config/database';
import { RoadStatus } from '@prisma/client';

export class RoadService {
  async getAllRoads(params: RoadQueryParams) {
    return roadRepository.findAll(params);
  }

  async getRoadById(id: string) {
    const road = await roadRepository.findById(id);
    if (!road) {
      throw { statusCode: 404, message: 'Road not found', code: 'ROAD_NOT_FOUND' };
    }
    return road;
  }

  async createRoad(
    data: {
      roadCode: string;
      name: string;
      state: string;
      district: string;
      block?: string;
      village?: string;
      lengthKm?: number;
      latitude: number;
      longitude: number;
      routeGeoJson?: any;
      status?: RoadStatus;
    },
    userId?: string
  ) {
    const existing = await roadRepository.findByCode(data.roadCode);
    if (existing) {
      throw { statusCode: 409, message: 'Road with this roadCode already exists', code: 'ROAD_CODE_EXISTS' };
    }

    const road = await roadRepository.create({
      roadCode: data.roadCode,
      name: data.name,
      state: data.state,
      district: data.district,
      block: data.block,
      village: data.village,
      lengthKm: data.lengthKm ?? 1.0,
      latitude: data.latitude,
      longitude: data.longitude,
      routeGeoJson: data.routeGeoJson,
      status: data.status || RoadStatus.OPERATIONAL,
    });

    await auditRepository.log({
      userId,
      action: 'ROAD_CREATED',
      entity: 'Road',
      entityId: road.id,
      metadata: { roadCode: road.roadCode, name: road.name },
    });

    return road;
  }

  async updateRoad(id: string, data: any, userId?: string) {
    await this.getRoadById(id);
    const updated = await roadRepository.update(id, data);

    await auditRepository.log({
      userId,
      action: 'ROAD_UPDATED',
      entity: 'Road',
      entityId: id,
      metadata: data,
    });

    return updated;
  }

  async deleteRoad(id: string, userId?: string) {
    await this.getRoadById(id);
    const deleted = await roadRepository.delete(id);

    await auditRepository.log({
      userId,
      action: 'ROAD_DELETED',
      entity: 'Road',
      entityId: id,
    });

    return deleted;
  }

  // Segments
  async getRoadSegments(roadId: string) {
    await this.getRoadById(roadId);
    return roadRepository.findSegmentsByRoadId(roadId);
  }

  async createRoadSegment(roadId: string, data: any, userId?: string) {
    await this.getRoadById(roadId);
    const segment = await roadRepository.createSegment({
      road: { connect: { id: roadId } },
      segmentCode: data.segmentCode,
      chainageStart: data.chainageStart,
      chainageEnd: data.chainageEnd,
      surfaceType: data.surfaceType || 'ASPHALT',
      laneCount: data.laneCount || 2,
      geometry: data.geometry,
      status: data.status || RoadStatus.OPERATIONAL,
    });

    await auditRepository.log({
      userId,
      action: 'ROAD_SEGMENT_CREATED',
      entity: 'RoadSegment',
      entityId: segment.id,
      metadata: { roadId, segmentCode: segment.segmentCode },
    });

    return segment;
  }

  // History & Metrics
  async getRoadHistory(roadId: string) {
    await this.getRoadById(roadId);
    const [inspections, maintenance] = await Promise.all([
      prisma.inspection.findMany({
        where: { roadId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.maintenanceCase.findMany({
        where: { roadId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return { inspections, maintenance };
  }

  async getRoadInspections(roadId: string) {
    await this.getRoadById(roadId);
    return prisma.inspection.findMany({
      where: { roadId },
      include: {
        inspector: { select: { id: true, fullName: true, email: true } },
        _count: { select: { mediaAssets: true, detections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRoadMaintenance(roadId: string) {
    await this.getRoadById(roadId);
    return prisma.maintenanceCase.findMany({
      where: { roadId },
      include: {
        assignedTeam: { select: { id: true, fullName: true } },
        verification: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const roadService = new RoadService();
