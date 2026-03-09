using System;
using System.Collections.Generic;

namespace PIMS_BE.DTOs.Assessment;

public class AssessmentDto
{
    public int AssessmentId { get; set; }
    public int SemesterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public bool IsFinal { get; set; }
    public bool IsLocked { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
    public string? Description { get; set; }
    public List<AssessmentCriterionDto>? Criteria { get; set; }
}
