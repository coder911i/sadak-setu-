import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireInspector } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze-image', requireInspector, AiController.analyzeImage);
router.post('/analyze-video', requireInspector, AiController.analyzeVideo);
router.get('/analysis/:id', AiController.getAnalysisById);
router.patch('/analysis/:id/correct', requireInspector, AiController.correctDamage);

export default router;
