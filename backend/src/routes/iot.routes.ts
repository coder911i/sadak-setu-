import { Router } from 'express';
import { IoTController } from '../controllers/iot.controller';

const router = Router();

// POST /api/v1/iot/telemetry - Live ESP32 hardware telemetry ingestion
router.post('/telemetry', IoTController.ingestTelemetry);

export default router;
