namespace PIMS_BE.DTOs.Notification;

public class CreateNotificationRequest
{
    public int? UserId { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
}
