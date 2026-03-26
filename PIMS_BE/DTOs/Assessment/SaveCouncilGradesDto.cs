using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Assessment
{
    public class SaveCouncilGradesDto
    {
        [Required]
        public int CouncilId { get; set; }

        [Required]
        public int GroupId { get; set; }

        [Required]
        public int AssessmentId { get; set; }

        [Required]
        public int ScheduleId { get; set; }

        [Required]
        public List<StudentCouncilScoreDto> StudentScores { get; set; } = new List<StudentCouncilScoreDto>();
    }

    public class StudentCouncilScoreDto
    {
        [Required]
        public int UserId { get; set; }

        // CriteriaId -> Score
        [Required]
        public Dictionary<int, decimal> CriteriaScores { get; set; } = new Dictionary<int, decimal>();
    }
}
