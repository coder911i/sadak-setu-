import { prisma } from '../config/database';
import {
  MaintenanceCase,
  MaintenanceStatus,
  PriorityLevel,
  Prisma,
  MaintenanceStatusHistory,
  RepairEvidence,
  VerificationResult,
  VerificationStatus,
} from '@prisma/client';

export class MaintenanceRepository {
  async findById(id: string) {
    return prisma.maintenanceCase.findUnique({
      where: { id },
      include: {
        road: true,
        segment: true,
        damage: { include: { mediaAsset: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
        assignedTeam: { select: { id: true, fullName: true, email: true, phone: true } },
        assignments: {
          include: {
            team: { select: { id: true, fullName: true, email: true } },
            assigner: { select: { id: true, fullName: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
        statusHistory: {
          include: { changedBy: { select: { id: true, fullName: true, role: true } } },
          orderBy: { timestamp: 'desc' },
        },
        evidence: {
          include: { uploadedBy: { select: { id: true, fullName: true } } },
          orderBy: { capturedAt: 'desc' },
        },
        verification: {
          include: { overrideBy: { select: { id: true, fullName: true, role: true } } },
        },
      },
    });
  }

  async create(data: Prisma.MaintenanceCaseCreateInput): Promise<MaintenanceCase> {
    return prisma.maintenanceCase.create({
      data,
      include: { road: true, damage: true },
    });
  }

  async update(id: string, data: Prisma.MaintenanceCaseUpdateInput): Promise<MaintenanceCase> {
    return prisma.maintenanceCase.update({
      where: { id },
      data,
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    roadId?: string;
    status?: MaintenanceStatus;
    priority?: PriorityLevel;
    teamId?: string;
  }): Promise<{ cases: MaintenanceCase[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceCaseWhereInput = {
      ...(params.roadId && { roadId: params.roadId }),
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
      ...(params.teamId && { assignedTeamId: params.teamId }),
    };

    const [cases, total] = await Promise.all([
      prisma.maintenanceCase.findMany({
        where,
        skip,
        take: limit,
        include: {
          road: { select: { id: true, name: true, roadCode: true } },
          assignedTeam: { select: { id: true, fullName: true } },
          verification: { select: { result: true, confidence: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.maintenanceCase.count({ where }),
    ]);

    return { cases, total };
  }

  /**
   * Atomic state machine transition with audit history.
   */
  async transitionStatus(
    caseId: string,
    previousStatus: MaintenanceStatus,
    newStatus: MaintenanceStatus,
    userId: string,
    reason?: string
  ): Promise<MaintenanceCase> {
    return prisma.$transaction(async (tx) => {
      // 1. Update case status
      const updatedCase = await tx.maintenanceCase.update({
        where: { id: caseId },
        data: {
          status: newStatus,
          ...(newStatus === MaintenanceStatus.CLOSED && { closedAt: new Date() }),
        },
      });

      // 2. Append to status history
      await tx.maintenanceStatusHistory.create({
        data: {
          maintenanceCaseId: caseId,
          previousStatus,
          newStatus,
          changedById: userId,
          reason,
        },
      });

      return updatedCase;
    });
  }

  // Assignments
  async assignTeam(
    caseId: string,
    teamId: string,
    assignedById: string,
    expectedCompletionDate?: Date,
    notes?: string
  ): Promise<MaintenanceCase> {
    return prisma.$transaction(async (tx) => {
      const currentCase = await tx.maintenanceCase.findUniqueOrThrow({ where: { id: caseId } });

      const updatedCase = await tx.maintenanceCase.update({
        where: { id: caseId },
        data: {
          assignedTeamId: teamId,
          assignedById,
          assignedAt: new Date(),
          status: MaintenanceStatus.ASSIGNED,
          expectedCompletionDate,
        },
      });

      await tx.maintenanceAssignment.create({
        data: {
          maintenanceCaseId: caseId,
          teamId,
          assignedById,
          notes,
        },
      });

      await tx.maintenanceStatusHistory.create({
        data: {
          maintenanceCaseId: caseId,
          previousStatus: currentCase.status,
          newStatus: MaintenanceStatus.ASSIGNED,
          changedById: assignedById,
          reason: `Assigned to team ${teamId}`,
        },
      });

      return updatedCase;
    });
  }

  // Evidence
  async addEvidence(data: Prisma.RepairEvidenceCreateInput): Promise<RepairEvidence> {
    return prisma.repairEvidence.create({ data });
  }

  // Verification Result
  async upsertVerificationResult(
    caseId: string,
    data: {
      beforeMediaUrl: string;
      afterMediaUrl: string;
      result: VerificationStatus;
      confidence: number;
      reason: string;
      visualSimilarity?: number;
      defectReduction?: number;
      verifiedBy: string;
    }
  ): Promise<VerificationResult> {
    return prisma.verificationResult.upsert({
      where: { maintenanceCaseId: caseId },
      create: {
        maintenanceCaseId: caseId,
        ...data,
      },
      update: data,
    });
  }

  // Manual Override
  async manualOverride(
    caseId: string,
    overrideById: string,
    action: 'APPROVE' | 'REJECT' | 'RETURN_TO_TEAM',
    overrideReason: string
  ): Promise<MaintenanceCase> {
    return prisma.$transaction(async (tx) => {
      const currentCase = await tx.maintenanceCase.findUniqueOrThrow({ where: { id: caseId } });
      const newStatus =
        action === 'APPROVE'
          ? MaintenanceStatus.VERIFIED
          : action === 'RETURN_TO_TEAM'
          ? MaintenanceStatus.RETURNED_TO_TEAM
          : MaintenanceStatus.REOPENED;

      const verificationResultStatus =
        action === 'APPROVE' ? VerificationStatus.VERIFIED : VerificationStatus.NOT_VERIFIED;

      // Update verification record
      await tx.verificationResult.updateMany({
        where: { maintenanceCaseId: caseId },
        data: {
          isManualOverride: true,
          overrideById,
          overrideReason,
          overrideAt: new Date(),
          result: verificationResultStatus,
        },
      });

      // Update case
      const updatedCase = await tx.maintenanceCase.update({
        where: { id: caseId },
        data: { status: newStatus },
      });

      // Audit history
      await tx.maintenanceStatusHistory.create({
        data: {
          maintenanceCaseId: caseId,
          previousStatus: currentCase.status,
          newStatus,
          changedById: overrideById,
          reason: `Manual Override (${action}): ${overrideReason}`,
        },
      });

      return updatedCase;
    });
  }
}

export const maintenanceRepository = new MaintenanceRepository();
