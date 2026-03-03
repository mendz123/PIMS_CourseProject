using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Assessment
{
    public class SaveGradesDto
    {
        [Required]
        public int AssessmentId { get; set; }

        [Required]
        public int GroupId { get; set; }

        public string? TeacherComment { get; set; }

        [Required]
        public List<StudentScoreDto> StudentScores { get; set; } = new List<StudentScoreDto>();
    }

    public class StudentScoreDto
    {
        [Required]
        public int UserId { get; set; }

        [Range(0, 10, ErrorMessage = "Điểm phải nằm trong khoảng 0 đến 10")]
        public decimal Score { get; set; }
    }
}
