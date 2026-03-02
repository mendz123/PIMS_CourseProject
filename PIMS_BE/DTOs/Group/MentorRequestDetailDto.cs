namespace PIMS_BE.DTOs.Group
{
    public class MentorRequestDetailDto
    {
        public int RequestId { get; set; }
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public int LeaderId { get; set; }
        public string LeaderName { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public List<GroupMemberDto> Members { get; set; } = new();
        public string? Message { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
    }
}
