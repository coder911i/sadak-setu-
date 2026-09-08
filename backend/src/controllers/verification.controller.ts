import { Request, Response, NextFunction } from 'express';
import { verificationService } from '../services/verification.service';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/api-response';

export class VerificationController {
  static async getVerificationByCaseId(req: Request, res: Response, next: NextFunction) {
    try {
      const verification = await prisma.verificationResult.findUnique({
        where: { maintenanceCaseId: String(req.params.caseId) },
        include: {
          maintenanceCase: { select: { id: true, caseNumber: true, status: true } },
          overrideBy: { select: { id: true, fullName: true, role: true } },
        },
      });

      if (!verification) {
        return ApiResponse.notFound(res, 'Verification record not found for this case');
      }

      return ApiResponse.success(res, verification, 'Verification result retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async manualOverride(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, reason } = req.body;
      const updatedCase = await verificationService.supervisorOverride(
        req.params.caseId as string,
        { action, reason },
        req.user!.userId
      );

      return ApiResponse.success(res, updatedCase, 'Manual supervisor override executed successfully');
    } catch (error) {
      next(error);
    }
  }
}
