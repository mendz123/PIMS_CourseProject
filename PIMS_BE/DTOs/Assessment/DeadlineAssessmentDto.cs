namespace PIMS_BE.DTOs.Assessment
{
    public class DeadlineAssessmentDto
    {
        public int AssessmentId { get; set; }
        public string? Title { get; set; }
        public DateTime? Deadline { get; set; }
        public string? Description { get; set; }
    }
}
