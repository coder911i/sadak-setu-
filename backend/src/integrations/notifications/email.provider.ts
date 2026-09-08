import { INotificationProvider, NotificationPayload } from './notification-provider.interface';
import { logger } from '../../utils/logger';

export class EmailNotificationProvider implements INotificationProvider {
  async send(payload: NotificationPayload): Promise<void> {
    // In production, integration with Resend, AWS SES, or Nodemailer
    logger.info(`[EMAIL DISPATCH] To User ID ${payload.userId}: ${payload.title} - ${payload.message}`);
  }
}
