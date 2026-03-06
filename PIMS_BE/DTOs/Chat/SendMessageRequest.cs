namespace PIMS_BE.DTOs.Chat;

public class SendMessageRequest
{
    public int ConversationId { get; set; }
    public string? Content { get; set; }
    public int MessageType { get; set; }
    public string? FileUrl { get; set; }
}
