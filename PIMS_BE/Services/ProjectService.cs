using Microsoft.EntityFrameworkCore;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Project;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IMemberRepository _memberRepo;
        private readonly IDriveFileService _driveFileService;
        private readonly IProjectSubmissionRepository _projectSubmission;
        private readonly string _submissionsFolderId;

        public ProjectService(
            IProjectRepository projectRepository, 
            IMemberRepository memberRepo, 
            IProjectSubmissionRepository projectSubmission, 
            IDriveFileService driveFileService, 
            IConfiguration configuration)
        {
            _projectRepository = projectRepository;
            _memberRepo = memberRepo;
            _driveFileService = driveFileService;
            _projectSubmission = projectSubmission;
            _submissionsFolderId = configuration["GoogleDrive:SubmissionsFolderId"] ?? throw new Exception("Google Drive Folder ID is not configured.");
        }

        public async Task<ProjectSubmission> SubmitReportAsync(SubmitProjectReportDto dto, int studentId)
        {
            var allowedExtensions = new[] { ".zip", ".rar", ".7z" };
            var extension = Path.GetExtension(dto.ReportFile.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception($"Định dạng file không hỗ trợ. Vui lòng nộp: {string.Join(", ", allowedExtensions)}");
            }

            var memberInfo = await _memberRepo.GetActiveMemberByUserIdAsync(studentId);
            if (memberInfo == null) throw new Exception("Bạn không ở trong nhóm nào để nộp báo cáo.");

            if (dto.ProjectId <= 0)
            {
                throw new Exception("Lỗi: Nhóm của bạn chưa được gán vào dự án nào.");
            }

            string fileId = await _driveFileService.UploadFileAsync(dto.ReportFile, _submissionsFolderId);

            var submission = new ProjectSubmission
            {
                ProjectId = dto.ProjectId,
                AssessmentId = dto.AssessmentId,
                GroupId = memberInfo.GroupId,
                SubmitterId = studentId,
                FileName = dto.ReportFile.FileName,
                FileResourceId = fileId,
                ReportUrl = $"https://drive.google.com/file/d/{fileId}/view",
                SubmittedAt = DateTime.Now
            };

            await _projectSubmission.AddAsync(submission);
            try
            {
                await _projectSubmission.SaveAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Lỗi hệ thống khi lưu lịch sử nộp bài: " + (ex.InnerException?.Message ?? ex.Message));
            }

            return submission;
        }

        public async Task<ApiResponse<ProjectDto>> SubmitProjectAsync(SubmitProjectDto dto, int userId)
        { 
            var memberInfo = await _memberRepo.GetActiveMemberByUserIdAsync(userId);
            var isMember = memberInfo != null && memberInfo.GroupId == dto.GroupId;

            if (!isMember)
            {
                return new ApiResponse<ProjectDto> { Success = false, Message = "You are not in this group." };
            }

            var project = new Project
            {
                GroupId = dto.GroupId,
                Title = dto.Title,
                Description = dto.Description,
                StatusId = 2 
            };

            await _projectRepository.AddAsync(project);
            await _projectRepository.SaveChangesAsync();

            return new ApiResponse<ProjectDto>
            {
                Success = true,
                Message = "Project submitted successfully",
                Data = MapToDto(project)
            };
        }

        // UC30: Update Submission
        public async Task<ApiResponse<ProjectSubmission>> UpdateSubmissionAsync(int submissionId, SubmitProjectReportDto dto, int userId)
        {
            var existingSubmission = await _projectSubmission.GetSubmissionByIdAsync(submissionId);
            if (existingSubmission == null)
                return new ApiResponse<ProjectSubmission> { Success = false, Message = "Submission not found" };

            if (existingSubmission.SubmitterId != userId)
                return new ApiResponse<ProjectSubmission> { Success = false, Message = "You don't have permission to update this" };

            var extension = Path.GetExtension(dto.ReportFile.FileName).ToLower();
            if (extension != ".zip" && extension != ".rar" && extension != ".7z")
                return new ApiResponse<ProjectSubmission> { Success = false, Message = "Unsupported file format" };

            if (!string.IsNullOrEmpty(existingSubmission.FileResourceId))
            {
                await _driveFileService.DeleteFileAsync(existingSubmission.FileResourceId);
            }

            string fileId = await _driveFileService.UploadFileAsync(dto.ReportFile, _submissionsFolderId);

            existingSubmission.FileName = dto.ReportFile.FileName;
            existingSubmission.FileResourceId = fileId;
            existingSubmission.ReportUrl = $"https://drive.google.com/file/d/{fileId}/view";
            existingSubmission.AssessmentId = dto.AssessmentId;
            existingSubmission.SubmittedAt = DateTime.Now;

            await _projectSubmission.UpdateAsync(existingSubmission);
            await _projectSubmission.SaveAsync();

            return new ApiResponse<ProjectSubmission> { Success = true, Message = "Report updated successfully", Data = existingSubmission };
        }

        // UC40: Withdraw Submission 
        public async Task<ApiResponse<bool>> WithdrawSubmissionAsync(int submissionId, int userId)
        {
            var submission = await _projectSubmission.GetSubmissionByIdAsync(submissionId);
            if (submission == null)
                return new ApiResponse<bool> { Success = false, Message = "Submission not found" };

            if (submission.SubmitterId != userId)
                return new ApiResponse<bool> { Success = false, Message = "Unauthorized" };
            
            if (!string.IsNullOrEmpty(submission.FileResourceId))
            {
                await _driveFileService.DeleteFileAsync(submission.FileResourceId);
            }
            
            await _projectSubmission.DeleteAsync(submission);
            await _projectSubmission.SaveAsync();

            return new ApiResponse<bool> { Success = true, Message = "Report withdrawn successfully", Data = true };
        }

        public async Task<ApiResponse<List<SubmissionHistoryDto>>> GetSubmissionHistoryAsync(int studentId)
        {
            var memberInfo = await _memberRepo.GetActiveMemberByUserIdAsync(studentId);

            if (memberInfo == null)
                return new ApiResponse<List<SubmissionHistoryDto>> { Success = false, Message = "Bạn chưa gia nhập nhóm nào." };

            var groupSubmissions = await _projectSubmission.GetSubmissionsByGroupIdAsync(memberInfo.GroupId);
            
            var historyDtos = groupSubmissions.Select(s => new SubmissionHistoryDto
            {
                SubmissionId = s.SubmissionId,
                FileName = s.FileName,
                ReportUrl = s.ReportUrl,
                SubmittedAt = s.SubmittedAt,
                AssessmentId = s.AssessmentId,
                AssessmentTitle = s.Assessment?.Title ?? "N/A",
                SubmitterId = s.SubmitterId,
                SubmitterName = s.Submitter?.FullName ?? "N/A",
                GroupId = s.GroupId,
                GroupName = s.Group?.GroupName ?? "N/A"
            }).ToList();

            return new ApiResponse<List<SubmissionHistoryDto>>
            {
                Success = true,
                Data = historyDtos
            };
        }

        public async Task<ApiResponse<ProjectDto>> GetProjectByStudentIdAsync(int studentId)
        {
            var memberInfo = await _memberRepo.GetActiveMemberByUserIdAsync(studentId);

            if (memberInfo == null)
                return new ApiResponse<ProjectDto> { Success = false, Message = "Bạn chưa gia nhập nhóm nào." };

            var studentProject = await _projectRepository.GetProjectByGroupIdAsync(memberInfo.GroupId);

            if (studentProject == null)
                return new ApiResponse<ProjectDto> { Success = false, Message = "Nhóm của bạn chưa được gán dự án." };

            return new ApiResponse<ProjectDto>
            {
                Success = true,
                Data = MapToDto(studentProject)
            };
        }

        private ProjectDto MapToDto(Project project)
        {
            return new ProjectDto
            {
                ProjectId = project.ProjectId,
                GroupId = project.GroupId,
                Title = project.Title,
                Description = project.Description,
                StatusId = project.StatusId
            };
        }
    }
}
