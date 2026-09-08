import { maintenanceRepository } from '../repositories/maintenance.repository';
import { auditRepository } from '../repositories/audit.repository';
import { aiClient } from '../integrations/ai/ai-client';
import { notificationService } from './notification.service';
import { MaintenanceStatus, VerificationStatus, Role } from '@prisma/client';

export class VerificationService {
  /**
   * Submits repair evidence and immediately triggers AI dual-evidence comparison.
   */
  async submitRepairAndVerify(
    caseId: string,
    data: {
      afterMediaUrl: string;
      notes?: string;
      latitude?: number;
      longitude?: number;
    },
    userId: string,
    userRole: Role
  ) {
    const mCase = await maintenanceRepository.findById(caseId);
    if (!mCase) {
      throw { statusCode: 404, message: 'Maintenance case not found', code: 'CASE_NOT_FOUND' };
    }

    // 1. Identify 'Before' media from existing damage detection or previous evidence
    const beforeMediaUrl =
      mCase.damage?.mediaAsset?.url ||
      mCase.evidence.find((e) => e.evidenceType === 'BEFORE')?.mediaUrl ||
      'https://sadak-setu.mock/storage/before-default.jpg';

    // 2. Transition state to REPAIR_SUBMITTED then AI_VERIFICATION
    await maintenanceRepository.transitionStatus(
      caseId,
      mCase.status,
      MaintenanceStatus.REPAIR_SUBMITTED,
      userId,
      'Repair evidence submitted by maintenance team'
    );

    await maintenanceRepository.transitionStatus(
      caseId,
      MaintenanceStatus.REPAIR_SUBMITTED,
      MaintenanceStatus.AI_VERIFICATION,
      userId,
      'AI Before/After dual visual audit in progress'
    );

    // 3. Save After Repair Evidence
    await maintenanceRepository.addEvidence({
      maintenanceCase: { connect: { id: caseId } },
      uploadedBy: { connect: { id: userId } },
      evidenceType: 'AFTER',
      mediaUrl: data.afterMediaUrl,
      storageKey: data.afterMediaUrl,
      latitude: data.latitude,
      longitude: data.longitude,
      notes: data.notes,
    });

    // 4. Invoke AI Verification Engine
    const aiResult = await aiClient.verifyBeforeAfter(beforeMediaUrl, data.afterMediaUrl);

    // 5. Store Verification Result record
    const verificationRecord = await maintenanceRepository.upsertVerificationResult(caseId, {
      beforeMediaUrl,
      afterMediaUrl: data.afterMediaUrl,
      result: aiResult.result,
      confidence: aiResult.confidence,
      reason: aiResult.reason,
      visualSimilarity: aiResult.visualSimilarity,
      defectReduction: aiResult.defectReduction,
      verifiedBy: 'AI_MODEL_YOLO_V8',
    });

    // 6. Update Maintenance Case state according to AI result
    let nextStatus: MaintenanceStatus = MaintenanceStatus.AI_VERIFICATION;
    if (aiResult.result === VerificationStatus.VERIFIED && aiResult.confidence >= 0.85) {
      nextStatus = MaintenanceStatus.VERIFIED;
    } else if (aiResult.result === VerificationStatus.NOT_VERIFIED) {
      nextStatus = MaintenanceStatus.RETURNED_TO_TEAM;
    } else {
      // Uncertainty -> Remains in AI_VERIFICATION with REVIEW_REQUIRED
      nextStatus = MaintenanceStatus.AI_VERIFICATION;
    }

    if (nextStatus !== MaintenanceStatus.AI_VERIFICATION) {
      await maintenanceRepository.transitionStatus(
        caseId,
        MaintenanceStatus.AI_VERIFICATION,
        nextStatus,
        userId,
        `AI Automated Verdict: ${aiResult.result} (${(aiResult.confidence * 100).toFixed(1)}% confidence)`
      );
    }

    // 7. Audit log
    await auditRepository.log({
      userId,
      action: 'REPAIR_VERIFIED_BY_AI',
      entity: 'MaintenanceCase',
      entityId: caseId,
      metadata: {
        result: aiResult.result,
        confidence: aiResult.confidence,
        defectReduction: aiResult.defectReduction,
      },
    });

    // 8. Notify team or supervisor
    if (mCase.assignedTeamId) {
      await notificationService.notifyUser(mCase.assignedTeamId, {
        title: `Verification Result: ${aiResult.result}`,
        message: aiResult.reason,
        type: aiResult.result === VerificationStatus.VERIFIED ? 'SUCCESS' : 'WARNING',
        metadata: { caseId, result: aiResult.result },
      });
    }

    return {
      caseId,
      status: nextStatus,
      verification: verificationRecord,
    };
  }

  /**
   * Human supervisor override for ambiguous AI verification results.
   */
  async supervisorOverride(
    caseId: string,
    data: {
      action: 'APPROVE' | 'REJECT' | 'RETURN_TO_TEAM';
      reason: string;
    },
    supervisorId: string
  ) {
    const mCase = await maintenanceRepository.findById(caseId);
    if (!mCase) {
      throw { statusCode: 404, message: 'Maintenance case not found', code: 'CASE_NOT_FOUND' };
    }

    const updated = await maintenanceRepository.manualOverride(
      caseId,
      supervisorId,
      data.action,
      data.reason
    );

    await auditRepository.log({
      userId: supervisorId,
      action: 'VERIFICATION_MANUAL_OVERRIDE',
      entity: 'MaintenanceCase',
      entityId: caseId,
      metadata: { action: data.action, reason: data.reason },
    });

    return updated;
  }
}

export const verificationService = new VerificationService();
