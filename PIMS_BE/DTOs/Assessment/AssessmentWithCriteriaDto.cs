using System.Collections.Generic;

namespace PIMS_BE.DTOs.Assessment;

public class AssessmentWithCriteriaDto
{
    public int AssessmentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public bool IsFinal { get; set; }
    public bool IsLocked { get; set; }
    public List<AssessmentCriterionDto> Criteria { get; set; } = new();
    public decimal TotalCriteriaWeight { get; set; }
    public bool IsValid => TotalCriteriaWeight == 100m;
}
