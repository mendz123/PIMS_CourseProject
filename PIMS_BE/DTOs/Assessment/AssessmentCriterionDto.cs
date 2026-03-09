namespace PIMS_BE.DTOs.Assessment;

public class AssessmentCriterionDto
{
    public int CriteriaId { get; set; }
    public int AssessmentId { get; set; }
    public string CriteriaName { get; set; } = string.Empty;
    public decimal Weight { get; set; }
}
