import { inspectionRepository } from '../repositories/inspection.repository';
import { roadRepository } from '../repositories/road.repository';
import { auditRepository } from '../repositories/audit.repository';
import { InspectionStatus, InspectionType } from '@prisma/client';

export class InspectionService {
  async getAllInspections(params: {
    page?: number;
    limit?: number;
    roadId?: string;
    inspectorId?: string;
    status?: InspectionStatus;
  }) {
    return inspectionRepository.findAll(params);
  }

  async getInspectionById(id: string) {
    const inspection = await inspectionRepository.findById(id);
    if (!inspection) {
      throw { statusCode: 404, message: 'Inspection not found', code: 'INSPECTION_NOT_FOUND' };
    }
    return inspection;
  }

  async startInspection(data: {
    roadId: string;
    inspectorId: string;
    inspectionType?: InspectionType;
    remarks?: string;
  }) {
    const road = await roadRepository.findById(data.roadId);
    if (!road) {
      throw { statusCode: 404, message: 'Road not found', code: 'ROAD_NOT_FOUND' };
    }

    const inspection = await inspectionRepository.create({
      road: { connect: { id: data.roadId } },
      inspector: { connect: { id: data.inspectorId } },
      inspectionType: data.inspectionType || InspectionType.ROUTINE_SURVEY,
      status: InspectionStatus.IN_PROGRESS,
      startedAt: new Date(),
      remarks: data.remarks,
    });

    await auditRepository.log({
      userId: data.inspectorId,
      action: 'INSPECTION_STARTED',
      entity: 'Inspection',
      entityId: inspection.id,
      metadata: { roadId: data.roadId, type: inspection.inspectionType },
    });

    return inspection;
  }

  async updateInspection(id: string, data: any, userId?: string) {
    await this.getInspectionById(id);
    const updated = await inspectionRepository.update(id, data);

    await auditRepository.log({
      userId,
      action: 'INSPECTION_UPDATED',
      entity: 'Inspection',
      entityId: id,
      metadata: data,
    });

    return updated;
  }

  async completeInspection(
    id: string,
    data: { totalDistanceMeters?: number; remarks?: string },
    userId?: string
  ) {
    const existing = await this.getInspectionById(id);
    if (existing.status === InspectionStatus.COMPLETED) {
      throw { statusCode: 400, message: 'Inspection is already marked as completed', code: 'ALREADY_COMPLETED' };
    }

    const updated = await inspectionRepository.update(id, {
      status: InspectionStatus.COMPLETED,
      completedAt: new Date(),
      totalDistanceMeters: data.totalDistanceMeters ?? existing.totalDistanceMeters,
      remarks: data.remarks || existing.remarks,
    });

    await auditRepository.log({
      userId,
      action: 'INSPECTION_COMPLETED',
      entity: 'Inspection',
      entityId: id,
      metadata: { totalDistanceMeters: updated.totalDistanceMeters },
    });

    return updated;
  }
}

export const inspectionService = new InspectionService();
