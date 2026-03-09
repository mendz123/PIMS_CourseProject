export interface NotificationDto {
  notificationId: number;
  userId: number;
  title: string | null;
  content: string | null;
  isRead: boolean | null;
  createdAt: string | null;
}
