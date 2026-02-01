using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Assessment;

public class UpdateAssessmentDto
{
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
    public string? Title { get; set; }

    [Range(0.01, 100, ErrorMessage = "Weight must be between 0.01 and 100")]
    public decimal? Weight { get; set; }

    public bool? IsFinal { get; set; }

    public bool? IsLocked { get; set; }
}
