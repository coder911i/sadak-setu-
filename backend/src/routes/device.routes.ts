import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createDeviceSchema, telemetryPayloadSchema } from '../validators/device.validator';

const router = Router();

router.use(authenticate);

router.get('/', DeviceController.getAllDevices);
router.get('/:id', DeviceController.getDeviceById);
router.post('/', requireAdmin, validate(createDeviceSchema), DeviceController.createDevice);
router.post('/:id/telemetry', validate(telemetryPayloadSchema), DeviceController.ingestTelemetry);
router.get('/:id/telemetry', DeviceController.getTelemetry);
router.post('/:id/simulate', DeviceController.simulateTelemetry);

export default router;
