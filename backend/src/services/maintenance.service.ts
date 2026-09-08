import { maintenanceRepository } from '../repositories/maintenance.repository';
import { roadRepository } from '../repositories/road.repository';
import { auditRepository } from '../repositories/audit.repository';
import { PriorityEngine } from './priority.service';
import { notificationService } from './notification.service';
import { MaintenanceStatus, PriorityLevel, Role } from '@prisma/client';

// Valid finite state machine transitions map
const VALID_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.OPEN]: [MaintenanceStatus.ASSIGNED, MaintenanceStatus.CLOSED],
  [MaintenanceStatus.ASSIGNED]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.ASSIGNED],
  [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.REPAIR_SUBMITTED, MaintenanceStatus.RETURNED_TO_TEAM],
  [MaintenanceStatus.REPAIR_SUBMITTED]: [MaintenanceStatus.AI_VERIFICATION],
  [MaintenanceStatus.AI_VERIFICATION]: [
    MaintenanceStatus.VERIFIED,
    MaintenanceStatus.RETURNED_TO_TEAM,
    MaintenanceStatus.IN_PROGRESS,
  ],
  [MaintenanceStatus.VERIFIED]: [MaintenanceStatus.CLOSED, MaintenanceStatus.REOPENED],
  [MaintenanceStatus.RETURNED_TO_TEAM]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.REOPENED],
  [MaintenanceStatus.REOPENED]: [MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS],
  [MaintenanceStatus.CLOSED]: [MaintenanceStatus.REOPENED],
};

export class MaintenanceService {
  async getAllCases(params: {
    page?: number;
    limit?: number;
    roadId?: string;
    status?: MaintenanceStatus;
    priority?: PriorityLevel;
    teamId?: string;
  }) {
    return maintenanceRepository.findAll(params);
  }

  async getCaseById(id: string) {
    const mCase = await maintenanceRepository.findById(id);
    if (!mCase) {
      throw { statusCode: 404, message: 'Maintenance case not found', code: 'CASE_NOT_FOUND' };
    }
    return mCase;
  }

  async createCase(
    data: {
      roadId: string;
      segmentId?: string;
      damageId?: string;
      priority?: PriorityLevel;
      description: string;
      assignedTeamId?: string;
      expectedCompletionDate?: string;
    },
    userId: string
  ) {
    const road = await roadRepository.findById(data.roadId);
    if (!road) {
      throw { statusCode: 404, message: 'Road not found', code: 'ROAD_NOT_FOUND' };
    }

    const caseNumber = `MC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const mCase = await maintenanceRepository.create({
      caseNumber,
      road: { connect: { id: data.roadId } },
      ...(data.segmentId && { segment: { connect: { id: data.segmentId } } }),
      ...(data.damageId && { damage: { connect: { id: data.damageId } } }),
      createdBy: { connect: { id: userId } },
      ...(data.assignedTeamId && { assignedTeam: { connect: { id: data.assignedTeamId } } }),
      priority: data.priority || PriorityLevel.HIGH,
      status: data.assignedTeamId ? MaintenanceStatus.ASSIGNED : MaintenanceStatus.OPEN,
      description: data.description,
      expectedCompletionDate: data.expectedCompletionDate ? new Date(data.expectedCompletionDate) : undefined,
    });

    await auditRepository.log({
      userId,
      action: 'MAINTENANCE_CASE_CREATED',
      entity: 'MaintenanceCase',
      entityId: mCase.id,
      metadata: { caseNumber, priority: mCase.priority },
    });

    return mCase;
  }

  /**
   * Enforces finite state transitions.
   */
  async transitionState(
    caseId: string,
    newStatus: MaintenanceStatus,
    userId: string,
    userRole: Role,
    reason?: string
  ) {
    const currentCase = await this.getCaseById(caseId);
    const allowed = VALID_TRANSITIONS[currentCase.status] || [];

    if (!allowed.includes(newStatus)) {
      throw {
        statusCode: 400,
        message: `Invalid state transition from ${currentCase.status} to ${newStatus}. Permitted next states: [${allowed.join(', ')}]`,
        code: 'INVALID_STATE_TRANSITION',
      };
    }

    const updated = await maintenanceRepository.transitionStatus(
      caseId,
      currentCase.status,
      newStatus,
      userId,
      reason
    );

    await auditRepository.log({
      userId,
      action: 'MAINTENANCE_STATE_TRANSITION',
      entity: 'MaintenanceCase',
      entityId: caseId,
      metadata: { from: currentCase.status, to: newStatus, reason },
    });

    return updated;
  }

  // Assign Team
  async assignTeam(
    caseId: string,
    teamId: string,
    assignedById: string,
    expectedCompletionDate?: string,
    notes?: string
  ) {
    await this.getCaseById(caseId);
    const updated = await maintenanceRepository.assignTeam(
      caseId,
      teamId,
      assignedById,
      expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
      notes
    );

    await notificationService.notifyUser(teamId, {
      title: 'New Maintenance Case Assigned',
      message: `You have been assigned Maintenance Case ${updated.caseNumber}`,
      type: 'ALERT',
      metadata: { caseId, caseNumber: updated.caseNumber },
    });

    return updated;
  }

  // Accept & Start Work
  async acceptCase(caseId: string, userId: string, role: Role) {
    return this.transitionState(caseId, MaintenanceStatus.IN_PROGRESS, userId, role, 'Team accepted and began repair work');
  }

  async startWork(caseId: string, userId: string, role: Role) {
    return this.transitionState(caseId, MaintenanceStatus.IN_PROGRESS, userId, role, 'Repair work commenced on-site');
  }

  // Reopen
  async reopenCase(caseId: string, userId: string, role: Role, reason: string) {
    return this.transitionState(caseId, MaintenanceStatus.REOPENED, userId, role, reason);
  }

  // Close
  async closeCase(caseId: string, userId: string, role: Role) {
    return this.transitionState(caseId, MaintenanceStatus.CLOSED, userId, role, 'Case completed and officially verified');
  }
}

export const maintenanceService = new MaintenanceService();
