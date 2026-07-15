export type NotificationChannel = 'PUSH' | 'SMS' | 'EMAIL';

export interface Notification {
  id: string;
  alertId: string;
  channel: NotificationChannel;
  sentAt?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}
