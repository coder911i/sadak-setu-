import { Router } from 'express';
import { SensorMLController } from '../controllers/sensor-ml.controller';

const router = Router();

// POST /api/v1/sensor/predict - Manual sensor ML analysis
router.post('/predict', SensorMLController.predictAnomaly);

// GET /api/v1/sensor/health - Sensor ML service health check
router.get('/health', SensorMLController.healthCheck);

export default router;