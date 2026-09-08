import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getMyNotifications);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
