import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/api-response';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.userId);
      return ApiResponse.success(res, notifications, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id as string, req.user!.userId);
      return ApiResponse.success(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }
}
