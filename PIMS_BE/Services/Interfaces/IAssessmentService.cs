using PIMS_BE.DTOs.Assessment;

namespace PIMS_BE.Services.Interfaces;

public interface IAssessmentService
{
    Task<AssessmentDto> CreateAssessmentAsync(CreateAssessmentDto dto, int userId);
    Task<AssessmentDto> UpdateAssessmentAsync(int assessmentId, UpdateAssessmentDto dto, int userId);
    Task DeleteAssessmentAsync(int assessmentId, int userId);
    Task<AssessmentDto?> GetAssessmentByIdAsync(int assessmentId);
    Task<List<AssessmentDto>> GetAssessmentsBySemesterAsync(int semesterId);
    Task<AssessmentWithCriteriaDto?> GetAssessmentWithCriteriaAsync(int assessmentId);
    Task<List<AssessmentWithCriteriaDto>> GetAssessmentsWithCriteriaAsync(int semesterId);
    Task LockAssessmentAsync(int assessmentId, int userId);
    Task UnlockAssessmentAsync(int assessmentId, int userId);
    Task<bool> ValidateAssessmentWeightsAsync(int semesterId, int? excludeAssessmentId = null);
}
