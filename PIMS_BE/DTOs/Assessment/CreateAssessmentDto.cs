using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Assessment;

public class CreateAssessmentDto
{
    [Required(ErrorMessage = "Semester ID is required")]
    public int SemesterId { get; set; }

    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Weight is required")]
    [Range(0.01, 100, ErrorMessage = "Weight must be between 0.01 and 100")]
    public decimal Weight { get; set; }

    public bool IsFinal { get; set; } = false;
}
