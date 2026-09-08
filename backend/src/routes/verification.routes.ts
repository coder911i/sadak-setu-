import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAuthority } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { manualOverrideSchema } from '../validators/maintenance.validator';

const router = Router();

router.use(authenticate);

router.get('/:caseId', VerificationController.getVerificationByCaseId);
router.post('/:caseId/override', requireAuthority, validate(manualOverrideSchema), VerificationController.manualOverride);

export default router;
