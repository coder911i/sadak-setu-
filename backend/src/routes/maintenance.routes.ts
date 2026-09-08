import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireInspector, requireMaintenanceTeam, requireAuthority } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createMaintenanceCaseSchema,
  assignTeamSchema,
  submitRepairSchema,
  reopenCaseSchema,
  maintenanceQuerySchema,
} from '../validators/maintenance.validator';

const router = Router();

router.use(authenticate);

router.get('/cases', validate(maintenanceQuerySchema, 'query'), MaintenanceController.getAllCases);
router.get('/cases/:id', MaintenanceController.getCaseById);
router.post('/cases', requireInspector, validate(createMaintenanceCaseSchema), MaintenanceController.createCase);

router.post('/cases/:id/assign', requireAdmin, validate(assignTeamSchema), MaintenanceController.assignTeam);
router.post('/cases/:id/accept', requireMaintenanceTeam, MaintenanceController.acceptCase);
router.post('/cases/:id/start', requireMaintenanceTeam, MaintenanceController.startWork);
router.post('/cases/:id/submit-repair', requireMaintenanceTeam, validate(submitRepairSchema), MaintenanceController.submitRepair);
router.post('/cases/:id/reopen', requireAuthority, validate(reopenCaseSchema), MaintenanceController.reopenCase);
router.post('/cases/:id/close', requireAuthority, MaintenanceController.closeCase);

export default router;
