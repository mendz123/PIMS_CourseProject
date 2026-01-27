using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs.Project;
using PIMS_BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace PIMS_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize] // Đảm bảo người dùng phải đăng nhập
    public class SubmissionController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IDriveFileService _driveFileService;

        public SubmissionController(IProjectService projectService, IDriveFileService driveFileService)
        {
            _projectService = projectService;
            _driveFileService = driveFileService;
        }

        // 1. Nộp báo cáo mới
        [HttpPost("submit-report")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubmitReport([FromForm] SubmitProjectReportDto dto)
        {
            try
            {
                int studentId = 15;
                //int studentId = GetUserIdFromToken();
                var result = await _projectService.SubmitReportAsync(dto, studentId);

                return Ok(new { Success = true, Message = "Báo cáo đã được nộp thành công!", Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        // 2. Cập nhật báo cáo (Nộp đè file mới)
        [HttpPut("update-report/{submissionId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateReport(int submissionId, [FromForm] SubmitProjectReportDto dto)
        {
            try
            {
                int userId = GetUserIdFromToken();
                var result = await _projectService.UpdateSubmissionAsync(submissionId, dto, userId);

                if (!result.Success) return BadRequest(result);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        // 3. Rút bài nộp (Xóa báo cáo)
        [HttpDelete("withdraw-report/{submissionId}")]
        public async Task<IActionResult> WithdrawReport(int submissionId)
        {
            try
            {
                int userId = GetUserIdFromToken();
                var result = await _projectService.WithdrawSubmissionAsync(submissionId, userId);

                if (!result.Success) return BadRequest(result);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        // 4. Tải file từ Drive về (Dành cho GV/Mentor chấm bài)
        [HttpGet("download/{fileId}")]
        public async Task<IActionResult> Download(string fileId)
        {
            try
            {
                var fileBytes = await _driveFileService.DownloadFileAsync(fileId);
                // Bạn có thể lấy FileName thực tế từ DB nếu muốn tên file khi tải về chính xác hơn
                return File(fileBytes, "application/octet-stream", "submission_file.zip");
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Không thể tải file: " + ex.Message });
            }
        }

        // Hàm helper để lấy UserId từ Claim nhằm tránh lặp lại code
        private int GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new Exception("Phiên đăng nhập không hợp lệ hoặc thiếu User ID.");

            return int.Parse(userIdClaim);
        }
    }
}