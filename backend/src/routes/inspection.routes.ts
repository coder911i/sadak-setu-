import { Router } from 'express';
import { InspectionController } from '../controllers/inspection.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireInspector } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createInspectionSchema,
  updateInspectionSchema,
  completeInspectionSchema,
  inspectionQuerySchema,
} from '../validators/inspection.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(inspectionQuerySchema, 'query'), InspectionController.getAllInspections);
router.get('/:id', InspectionController.getInspectionById);
router.post('/', requireInspector, validate(createInspectionSchema), InspectionController.createInspection);
router.patch('/:id', requireInspector, validate(updateInspectionSchema), InspectionController.updateInspection);
router.post('/:id/complete', requireInspector, validate(completeInspectionSchema), InspectionController.completeInspection);
router.get('/:id/fusion', InspectionController.getInspectionFusion);

export default router;
