import { INotificationProvider, NotificationPayload } from './notification-provider.interface';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export class InAppNotificationProvider implements INotificationProvider {
  async send(payload: NotificationPayload): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type || 'INFO',
          metadata: payload.metadata || {},
        },
      });
    } catch (error: any) {
      logger.error('Failed to create in-app notification', { error: error.message, payload });
    }
  }
}
