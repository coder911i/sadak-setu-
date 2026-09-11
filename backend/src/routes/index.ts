import { Router } from 'express';
import authRoutes from './auth.routes';
import roadRoutes from './road.routes';
import inspectionRoutes from './inspection.routes';
import mediaRoutes from './media.routes';
import aiRoutes from './ai.routes';
import deviceRoutes from './device.routes';
import maintenanceRoutes from './maintenance.routes';
import verificationRoutes from './verification.routes';
import scoringRoutes from './scoring.routes';
import analyticsRoutes from './analytics.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';
import iotRoutes from './iot.routes';
import sensorMLRoutes from './sensor-ml.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/roads', roadRoutes);
apiRouter.use('/inspections', inspectionRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/devices', deviceRoutes);
apiRouter.use('/maintenance', maintenanceRoutes);
apiRouter.use('/verification', verificationRoutes);
apiRouter.use('/scoring', scoringRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/iot', iotRoutes);
apiRouter.use('/sensor', sensorMLRoutes);

export default apiRouter;

