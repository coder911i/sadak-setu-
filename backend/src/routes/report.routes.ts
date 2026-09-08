import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAuthority } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.post('/generate', requireAuthority, ReportController.generateReport);

export default router;
