namespace PIMS_BE.DTOs.Chat;

public class ConversationDto
{
    public int Id { get; set; }
    public int Type { get; set; } // 1: Direct, 2: Group
    public string? Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public MessageDto? LastMessage { get; set; }
    public List<ParticipantDto> Participants { get; set; } = new();
}

public class ParticipantDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int Role { get; set; }
}
