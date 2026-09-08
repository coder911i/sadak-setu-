import { InAppNotificationProvider } from '../integrations/notifications/in-app.provider';
import { EmailNotificationProvider } from '../integrations/notifications/email.provider';
import { prisma } from '../config/database';

export class NotificationService {
  private inAppProvider: InAppNotificationProvider;
  private emailProvider: EmailNotificationProvider;

  constructor() {
    this.inAppProvider = new InAppNotificationProvider();
    this.emailProvider = new EmailNotificationProvider();
  }

  async notifyUser(
    userId: string,
    payload: {
      title: string;
      message: string;
      type?: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
      metadata?: Record<string, any>;
    }
  ) {
    // Send in-app
    await this.inAppProvider.send({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      metadata: payload.metadata,
    });

    // Send email dispatch
    await this.emailProvider.send({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
    });
  }

  async getUserNotifications(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
