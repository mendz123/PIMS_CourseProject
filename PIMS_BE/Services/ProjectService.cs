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
        private readonly IGenericRepository<GroupMember> _memberRepo;
        private readonly IDriveFileService _driveFileService;
        private readonly IProjectSubmissionRepository _projectSubmission;
        private readonly string _submissionsFolderId;

        public ProjectService(IProjectRepository projectRepository, IGenericRepository<GroupMember> memberRepo, IProjectSubmissionRepository projectSubmission, IDriveFileService driveFileService, IConfiguration configuration)
        {
            _projectRepository = projectRepository;
            _memberRepo = memberRepo;

            _driveFileService = driveFileService;
            _projectSubmission = projectSubmission;
            _submissionsFolderId = configuration["GoogleDrive:SubmissionsFolderId"] ?? throw new Exception("Google Drive Folder ID is not configured.");
        }


        public async Task<ProjectSubmission> SubmitReportAsync(SubmitProjectReportDto dto, int studentId)
        {
            // 1. Định nghĩa danh sách các đuôi file nén được phép
            var allowedExtensions = new[] { ".zip", ".rar", ".7z" };

            // Lấy đuôi file và kiểm tra
            var extension = Path.GetExtension(dto.ReportFile.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception($"Unsupported file format. Please upload: {string.Join(", ", allowedExtensions)}");
            }

            // 2. Tự động tìm GroupId của sinh viên
            //var allMembers = await _memberRepo.GetAllAsync();
            //var memberInfo = allMembers.FirstOrDefault(m => m.UserId == studentId && m.StatusId == 1);
            //if (memberInfo == null) throw new Exception("You are not active in any group to submit reports.");

            // 3. Upload file lên Google Drive
            string fileId = await _driveFileService.UploadFileAsync(dto.ReportFile, _submissionsFolderId);

            // 4. Tạo bản ghi Submission
            var submission = new ProjectSubmission
            {
                ProjectId = dto.ProjectId,
                AssessmentId = dto.AssessmentId,
                
                GroupId = 1,
                //GroupId = memberInfo.GroupId,
                SubmitterId = studentId,
                FileName = dto.ReportFile.FileName,
                FileResourceId = fileId,
                ReportUrl = $"https://drive.google.com/file/d/{fileId}/view",
                //Note = dto.Note,
                SubmittedAt = DateTime.Now
            };

            await _projectSubmission.AddAsync(submission);
            try
            {
                await _projectSubmission.SaveAsync();
            }
            catch (DbUpdateException ex)
            {
                // Xem lỗi chi tiết ở đây: ex.InnerException.Message
                throw new Exception("Lỗi DB: " + ex.InnerException?.Message ?? ex.Message);
            }

            return submission;
        }

        public async Task<ApiResponse<ProjectDto>> SubmitProjectAsync(SubmitProjectDto dto, int userId)
        {
            // 1. Kiểm tra thành viên nhóm (Sửa lỗi GetFirstOrDefaultAsync)
            var members = await _memberRepo.GetAllAsync();
            var isMember = members.Any(m => m.UserId == userId && m.GroupId == dto.GroupId);

            if (!isMember)
            {
                return new ApiResponse<ProjectDto> { Success = false, Message = "You are not in this group." };
            }

            // 2. Tạo Project mới
            var project = new Project
            {
                GroupId = dto.GroupId,
                Title = dto.Title,
                Description = dto.Description,
                StatusId = 2 // Trạng thái 'SUBMITTED' trong DB của bạn
            };

            await _projectRepository.AddAsync(project);

            // 3. Trả về kết quả (Sửa lỗi Constructor)
            return new ApiResponse<ProjectDto>
            {
                Success = true,
                Message = "Report submitted successfully",
                Data = MapToDto(project)
            };
        }

        // UC30: Update Submission
        public async Task<ApiResponse<ProjectSubmission>> UpdateSubmissionAsync(int submissionId, SubmitProjectReportDto dto, int userId)
        {
            // 1. Tìm bản ghi nộp bài cũ
            var existingSubmission = await _projectSubmission.GetByIdAsync(submissionId);
            if (existingSubmission == null)
                return new ApiResponse<ProjectSubmission> { Success = false, Message = "Submission not found" };

            // 2. Kiểm tra quyền (Chỉ người nộp hoặc trưởng nhóm mới có quyền sửa)
            if (existingSubmission.SubmitterId != userId)
                return new ApiResponse<ProjectSubmission> { Success = false, Message = "You don't have permission to update this" };

            // 3. Kiểm tra định dạng file mới
            var extension = Path.GetExtension(dto.ReportFile.FileName).ToLower();
            if (extension != ".zip")
                return new ApiResponse<ProjectSubmission> { Success = false, Message = "Only .zip files are allowed" };

            // 4. Quản lý file trên Google Drive (Xóa cũ, nộp mới)
            if (!string.IsNullOrEmpty(existingSubmission.FileResourceId))
            {
                await _driveFileService.DeleteFileAsync(existingSubmission.FileResourceId);
            }
            string fileId = await _driveFileService.UploadFileAsync(dto.ReportFile, _submissionsFolderId);

            // 5. Cập nhật thông tin trong DB
            existingSubmission.FileName = dto.ReportFile.FileName;
            existingSubmission.FileResourceId = fileId;
            existingSubmission.ReportUrl = $"https://drive.google.com/file/d/{fileId}/view";
            existingSubmission.AssessmentId = dto.AssessmentId; // Cập nhật kỳ đánh giá nếu cần
            //existingSubmission.Note = dto.Note;                 // Cập nhật ghi chú mới
            existingSubmission.SubmittedAt = DateTime.Now;

            await _projectSubmission.UpdateAsync(existingSubmission);
            await _projectSubmission.SaveAsync();

            return new ApiResponse<ProjectSubmission> { Success = true, Message = "Report updated successfully", Data = existingSubmission };
        }


        // UC40: Withdraw Submission (Rút/Xóa bản nộp bài)
        public async Task<ApiResponse<bool>> WithdrawSubmissionAsync(int submissionId, int userId)
        {
            var submission = await _projectSubmission.GetByIdAsync(submissionId);
            if (submission == null)
                return new ApiResponse<bool> { Success = false, Message = "Submission not found" };

            // Kiểm tra quyền: Đảm bảo người rút bài là người đã nộp
            if (submission.SubmitterId != userId)
                return new ApiResponse<bool> { Success = false, Message = "Unauthorized" };

            // 1. Xóa file vật lý trên Google Drive
            if (!string.IsNullOrEmpty(submission.FileResourceId))
            {
                await _driveFileService.DeleteFileAsync(submission.FileResourceId);
            }

            // 2. Xóa bản ghi trong Database
            await _projectSubmission.DeleteAsync(submission);
            await _projectSubmission.SaveAsync();

            return new ApiResponse<bool> { Success = true, Message = "Report withdrawn successfully", Data = true };
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
