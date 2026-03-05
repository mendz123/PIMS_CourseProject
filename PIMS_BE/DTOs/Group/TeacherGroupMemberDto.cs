namespace PIMS_BE.DTOs.Group
{
    public class TeacherGroupMemberDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        
        // Dictionary mapping AssessmentId to Score
        public Dictionary<int, decimal?> Scores { get; set; } = new Dictionary<int, decimal?>();
        
        // Total score calculated and stored in StudentFinalResults
        public decimal? TotalScore { get; set; }

        // Mảng chứa các cặp AssessmentId -> (CriteriaId -> Score)
        public Dictionary<int, Dictionary<int, decimal?>> CriteriaScores { get; set; } = new Dictionary<int, Dictionary<int, decimal?>>();
    }
}
