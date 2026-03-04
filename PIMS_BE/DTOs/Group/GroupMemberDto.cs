namespace PIMS_BE.DTOs.Group
{
    public class GroupMemberDto
    {
        public int GroupMemberId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public decimal? TotalScore { get; set; }
    }
}
