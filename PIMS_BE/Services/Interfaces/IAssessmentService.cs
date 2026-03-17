using PIMS_BE.DTOs.Assessment;

namespace PIMS_BE.Services.Interfaces;

public interface IAssessmentService
{
    Task<AssessmentDto> CreateAssessmentAsync(CreateAssessmentDto dto, int userId);
    Task<List<AssessmentDto>> BatchCreateAssessmentsAsync(BatchCreateAssessmentsDto dto, int userId);
    Task<AssessmentDto> UpdateAssessmentAsync(int assessmentId, UpdateAssessmentDto dto, int userId);
    Task DeleteAssessmentAsync(int assessmentId, int userId);
    Task<AssessmentDto?> GetAssessmentByIdAsync(int assessmentId);
    Task<List<AssessmentDto>> GetAssessmentsBySemesterAsync(int semesterId);
    Task<AssessmentWithCriteriaDto?> GetAssessmentWithCriteriaAsync(int assessmentId);
    Task<List<AssessmentWithCriteriaDto>> GetAssessmentsWithCriteriaAsync(int semesterId);
    Task LockAssessmentAsync(int assessmentId, int userId);
    Task UnlockAssessmentAsync(int assessmentId, int userId);
    Task<bool> ValidateAssessmentWeightsAsync(int semesterId, int? excludeAssessmentId = null);
    Task<IEnumerable<DeadlineAssessmentDto>> GetActiveIterations();

    /// <summary>Sinh viên xem tất cả assessment của bản thân (chứa điểm, deadline, lịch thi cuối kỳ nếu có)</summary>
    Task<StudentMyAssessmentsDto?> GetMyAssessmentsAsync(int userId);

    Task<bool> SaveGradesAsync(SaveGradesDto dto, int teacherId);
    Task<bool> SaveGradesByCriteriaAsync(SaveGradesByCriteriaDto dto, int teacherId);
    Task<bool> SaveCouncilGradesAsync(SaveCouncilGradesDto dto, int teacherId);
}
