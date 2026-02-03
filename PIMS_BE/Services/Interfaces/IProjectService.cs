using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Project;
using PIMS_BE.Models;

namespace PIMS_BE.Services.Interfaces
{
    public interface IProjectService
    { 
        Task <ApiResponse<ProjectDto>> SubmitProjectAsync(SubmitProjectDto dto, int userId);
        Task<ProjectSubmission> SubmitReportAsync(SubmitProjectReportDto dto, int studentId);
        Task<ApiResponse<List<SubmissionHistoryDto>>> GetSubmissionHistoryAsync(int studentId);
        Task<ApiResponse<ProjectSubmission>> UpdateSubmissionAsync(int submissionId, SubmitProjectReportDto dto, int userId);
        Task<ApiResponse<bool>> WithdrawSubmissionAsync(int submissionId, int userId);
        Task<ApiResponse<ProjectDto>> GetProjectByStudentIdAsync(int studentId);
    }
}
