using PIMS_BE.DTOs.Notification;

namespace PIMS_BE.Services.Interfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetNotificationsForUserAsync(int userId, bool? unreadOnly = null);
    Task<int> GetUnreadCountAsync(int userId);
    Task<NotificationDto?> CreateNotificationAsync(int userId, CreateNotificationRequest request);
    Task<NotificationDto?> MarkAsReadAsync(int userId, int notificationId);
    Task<int> MarkAllAsReadAsync(int userId);
}
