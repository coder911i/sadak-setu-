export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  metadata?: Record<string, any>;
}

export interface INotificationProvider {
  send(payload: NotificationPayload): Promise<void>;
}
