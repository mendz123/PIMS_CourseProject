namespace PIMS_BE.DTOs.Group
{
    public class TopicReviewDto
    {
        public int ProjectId { get; set; }
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string LeaderName { get; set; } = string.Empty;
        public string TopicName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}

