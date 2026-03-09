using System;

namespace PIMS_BE.DTOs.Project
{
    public class SubmissionHistoryDto
    {
        public int SubmissionId { get; set; }
        public string FileName { get; set; } = null!;
        public string ReportUrl { get; set; } = null!;
        public DateTime? SubmittedAt { get; set; }
        public int AssessmentId { get; set; }
        public string AssessmentTitle { get; set; } = null!;
        public int SubmitterId { get; set; }
        public string SubmitterName { get; set; } = null!;
        public int GroupId { get; set; }
        public string GroupName { get; set; } = null!;
    }
}
