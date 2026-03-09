using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Assessment;

public class UpdateCriterionDto
{
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Criteria name must be between 1 and 200 characters")]
    public string? CriteriaName { get; set; }

    [Range(0.01, 100, ErrorMessage = "Weight must be between 0.01 and 100")]
    public decimal? Weight { get; set; }
}
