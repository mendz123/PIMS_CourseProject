using PIMS_BE.DTOs.Notification;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<List<NotificationDto>> GetNotificationsForUserAsync(int userId, bool? unreadOnly = null)
    {
        IEnumerable<Notification> notifications;

        if (unreadOnly == true)
        {
            notifications = await _notificationRepository.FindAsync(
                n => n.UserId == userId && (n.IsRead == false || n.IsRead == null));
        }
        else
        {
            notifications = await _notificationRepository.FindAsync(n => n.UserId == userId);
        }

        return notifications
            .OrderByDescending(n => n.CreatedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        var unread = await _notificationRepository.FindAsync(
            n => n.UserId == userId && (n.IsRead == false || n.IsRead == null));
        return unread.Count();
    }

    public async Task<NotificationDto?> CreateNotificationAsync(int userId, CreateNotificationRequest request)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = request.Title,
            Content = request.Content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);
        await _notificationRepository.SaveChangesAsync();

        return MapToDto(notification);
    }

    public async Task<NotificationDto?> MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId);

        if (notification == null || notification.UserId != userId)
        {
            return null;
        }

        if (notification.IsRead == true)
        {
            return MapToDto(notification);
        }

        notification.IsRead = true;
        await _notificationRepository.UpdateAsync(notification);
        await _notificationRepository.SaveChangesAsync();

        return MapToDto(notification);
    }

    public async Task<int> MarkAllAsReadAsync(int userId)
    {
        var notifications = (await _notificationRepository.FindAsync(
            n => n.UserId == userId && (n.IsRead == false || n.IsRead == null)))
            .ToList();

        if (notifications.Count == 0)
        {
            return 0;
        }

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            await _notificationRepository.UpdateAsync(notification);
        }

        await _notificationRepository.SaveChangesAsync();

        return notifications.Count;
    }

    private static NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            NotificationId = notification.NotificationId,
            UserId = notification.UserId,
            Title = notification.Title,
            Content = notification.Content,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}
