namespace PIMS_BE.DTOs.Notification;

public class NotificationDto
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public bool? IsRead { get; set; }
    public DateTime? CreatedAt { get; set; }
}
