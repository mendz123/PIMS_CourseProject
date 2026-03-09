using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Assessment
{
    public class SaveGradesByCriteriaDto
    {
        [Required]
        public int AssessmentId { get; set; }

        [Required]
        public int GroupId { get; set; }

        public string? TeacherComment { get; set; }

        [Required]
        public List<StudentCriteriaScoreDto> StudentScores { get; set; } = new List<StudentCriteriaScoreDto>();
    }

    public class StudentCriteriaScoreDto
    {
        [Required]
        public int UserId { get; set; }

        // Mảng chứa các cặp CriteriaId -> Điểm (phải nằm trong khoảng 0-10)
        public Dictionary<int, decimal> CriteriaScores { get; set; } = new Dictionary<int, decimal>();
    }
}
