using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs.Project;
using PIMS_BE.Services;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;

namespace PIMS_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles= "STUDENT")]
    public class SubmissionController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IDriveFileService _driveFileService;
        private readonly IAssessmentService _assessmentService;

        public SubmissionController(IProjectService projectService, IDriveFileService driveFileService, IAssessmentService assessmentService)
        {
            _projectService = projectService;
            _driveFileService = driveFileService;
            _assessmentService = assessmentService;
        }

        [HttpPost("submit-report")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubmitReport([FromForm] SubmitProjectReportDto dto)
        {
            try
            {
                //int studentId = 15;
                int studentId = GetUserIdFromToken();

                var result = await _projectService.SubmitReportAsync(dto, studentId);

                return Ok(new { Success = true, Message = "Báo cáo đã được nộp thành công!", Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

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

        [HttpGet("download/{fileId}")]
        public async Task<IActionResult> Download(string fileId)
        {
            try
            {
                var fileBytes = await _driveFileService.DownloadFileAsync(fileId);
                return File(fileBytes, "application/octet-stream", "submission_file.zip");
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Không thể tải file: " + ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                int userId = GetUserIdFromToken();
                var result = await _projectService.GetSubmissionHistoryAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }
        [HttpGet("active-iterations")]
        public async Task<IActionResult> Get()
        {
            var result = await _assessmentService.GetActiveIterations();
            return Ok(result);
        }
        private int GetUserIdFromToken()
        {
           
            if (User.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("Bạn chưa đăng nhập hoặc Token không hợp lệ.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new Exception("Không tìm thấy UserId trong Token.");

            return int.Parse(userIdClaim);
        }
    }
}