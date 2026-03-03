namespace PIMS_BE.DTOs.Group
{
    public class InvitationDto
    {
        public int InvitationId { get; set; }
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public int InvitedUserId { get; set; }
        public string InvitedUserName { get; set; } = string.Empty;
        public int InvitedByUserId { get; set; }
        public string InvitedByUserName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
