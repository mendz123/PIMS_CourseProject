using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PIMS_BE.DTOs.Project
{
    public class SubmitProjectReportDto
    {
        [Required(ErrorMessage = "ProjectId is required.")]
        public int ProjectId { get; set; }

        [Required(ErrorMessage = "AssessmentId is required.")]
        public int AssessmentId { get; set; } // Chuyển thành bắt buộc (int thay vì int?)

        [Required(ErrorMessage = "Please select your report file.")]
        public IFormFile ReportFile { get; set; } = null!;

        //[StringLength(1000, ErrorMessage = "Note cannot exceed 1000 characters.")]
        //public string? Note { get; set; }
    }
}