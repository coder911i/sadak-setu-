import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', AnalyticsController.getOverview);
router.get('/roads', AnalyticsController.getRoadsAnalytics);
router.get('/damage', AnalyticsController.getDamageAnalytics);
router.get('/maintenance', AnalyticsController.getMaintenanceAnalytics);
router.get('/verification', AnalyticsController.getVerificationAnalytics);

export default router;
