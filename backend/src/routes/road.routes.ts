import { Router } from 'express';
import { RoadController } from '../controllers/road.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireInspector } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createRoadSchema, updateRoadSchema, createSegmentSchema, roadQuerySchema } from '../validators/road.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(roadQuerySchema, 'query'), RoadController.getAllRoads);
router.get('/:id', RoadController.getRoadById);
router.post('/', requireAdmin, validate(createRoadSchema), RoadController.createRoad);
router.patch('/:id', requireAdmin, validate(updateRoadSchema), RoadController.updateRoad);
router.delete('/:id', requireAdmin, RoadController.deleteRoad);

// Segments
router.get('/:id/segments', RoadController.getRoadSegments);
router.post('/:id/segments', requireAdmin, validate(createSegmentSchema), RoadController.createRoadSegment);

// Health, History, Inspections, Maintenance
router.get('/:id/health', RoadController.getRoadHealth);
router.get('/:id/history', RoadController.getRoadHistory);
router.get('/:id/inspections', RoadController.getRoadInspections);
router.get('/:id/maintenance', RoadController.getRoadMaintenance);

export default router;
