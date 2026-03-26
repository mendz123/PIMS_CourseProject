using System.Collections.Generic;

namespace PIMS_BE.DTOs.Assessment;

public class AssessmentWithCriteriaDto
{
    public int AssessmentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public bool IsFinal { get; set; }
    public bool IsRetake { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
    public string? Description { get; set; }
    public List<AssessmentCriterionDto> Criteria { get; set; } = new();
    public decimal TotalCriteriaWeight { get; set; }
    public bool IsValid => TotalCriteriaWeight == 100m;
    public bool HasSubmissions { get; set; }
    public bool HasScores { get; set; }
}
