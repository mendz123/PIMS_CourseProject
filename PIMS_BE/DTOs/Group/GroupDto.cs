namespace PIMS_BE.DTOs.Group
{
    public class GroupDto
    {
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int LeaderId { get; set; }
        public string LeaderName { get; set; } = string.Empty;
        public int? MentorId { get; set; }
        public string? MentorName { get; set; }
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public bool IsLeader { get; set; }
        public int MemberCount { get; set; }
    }
}
