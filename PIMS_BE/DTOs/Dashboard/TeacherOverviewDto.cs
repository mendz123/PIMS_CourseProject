using System.Collections.Generic;

namespace PIMS_BE.DTOs.Dashboard
{
    public class TeacherOverviewDto
    {
        public int ActiveGroupsCount { get; set; }
        public int PendingProposalsCount { get; set; }
        public int UnreviewedReportsCount { get; set; }
        public List<TopicApprovalDto> TopicApprovals { get; set; } = new();
        public List<PerformanceChartDto> PerformanceData { get; set; } = new();
        public List<ProgressItemDto> ProgressItems { get; set; } = new();
    }

    public class TopicApprovalDto
    {
        public string GroupId { get; set; }
        public string Title { get; set; }
        public string Date { get; set; }
    }

    public class PerformanceChartDto
    {
        public string Label { get; set; }
        public double Percentage { get; set; }
        public string ColorClass { get; set; }
    }

    public class ProgressItemDto
    {
        public string GroupName { get; set; }
        public string LeadStudent { get; set; }
        public string Milestone { get; set; }
        public int Progress { get; set; }
        public string Status { get; set; }
        public string StatusColorClass { get; set; }
    }
}
