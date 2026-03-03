namespace PIMS_BE.DTOs.Group
{
    public class TeacherGroupMemberDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        
        // Dictionary mapping AssessmentId to Score
        public Dictionary<int, decimal?> Scores { get; set; } = new Dictionary<int, decimal?>();
    }
}
