using PIMS_BE.DTOs.Assessment;

namespace PIMS_BE.Services.Interfaces;

public interface IAssessmentCriterionService
{
    Task<AssessmentCriterionDto> CreateCriterionAsync(int assessmentId, CreateCriterionDto dto, int userId);
    Task<List<AssessmentCriterionDto>> CreateMultipleCriteriaAsync(int assessmentId, List<CreateCriterionDto> dtos, int userId);
    Task<AssessmentCriterionDto> UpdateCriterionAsync(int criteriaId, UpdateCriterionDto dto, int userId);
    Task DeleteCriterionAsync(int criteriaId, int userId);
    Task<AssessmentCriterionDto?> GetCriterionByIdAsync(int criteriaId);
    Task<List<AssessmentCriterionDto>> GetCriteriaByAssessmentIdAsync(int assessmentId);
    Task<bool> ValidateCriteriaWeightsAsync(int assessmentId, int? excludeCriteriaId = null);
}
