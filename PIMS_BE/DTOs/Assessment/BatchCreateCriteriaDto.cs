using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Assessment;

public class BatchCreateCriteriaDto
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one criterion is required")]
    public List<CreateCriterionDto> Criteria { get; set; } = new();
}
