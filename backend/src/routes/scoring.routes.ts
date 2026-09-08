import { Router } from 'express';
import { ScoringController } from '../controllers/scoring.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { calculateScoreSchema } from '../validators/scoring.validator';

const router = Router();

router.use(authenticate);

router.post('/calculate', validate(calculateScoreSchema), ScoringController.calculateScore);
router.get('/roads/:roadId/health', ScoringController.getRoadHealth);

export default router;
