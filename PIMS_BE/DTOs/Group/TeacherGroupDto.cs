using System;
using System.Collections.Generic;

namespace PIMS_BE.DTOs.Group
{
    public class TeacherGroupDto
    {
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        
        // List of submissions for this group in the current semester/assessment
        public List<GroupSubmissionDto> SubmittedDocs { get; set; } = new List<GroupSubmissionDto>();
    }

    public class GroupSubmissionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public DateTime? SubmittedAt { get; set; }
        public int AssessmentId { get; set; }
    }
}
