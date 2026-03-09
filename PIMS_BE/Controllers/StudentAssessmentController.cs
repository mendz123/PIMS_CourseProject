using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Assessment;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>
/// Dành cho Sinh viên: Xem thông tin assessment của bản thân
/// (điểm, deadline, lịch bảo vệ nếu là final)
/// </summary>
[ApiController]
[Route("api/student/assessments")]
[Authorize(Roles = "STUDENT")]
public class StudentAssessmentController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;
    private readonly ILogger<StudentAssessmentController> _logger;

    public StudentAssessmentController(
        IAssessmentService assessmentService,
        ILogger<StudentAssessmentController> logger)
    {
        _assessmentService = assessmentService;
        _logger = logger;
    }

    /// <summary>
    /// Sinh viên xem tất cả assessment của bản thân trong học kỳ hiện tại.
    /// Trả về: thông tin đề tài, danh sách assessment kèm điểm và deadline.
    /// Nếu là final assessment thì có thêm ngày/giờ/phòng bảo vệ.
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<StudentMyAssessmentsDto>>> GetMyAssessments()
    {
        try
        {
            var userId = GetUserIdFromToken();
            _logger.LogInformation("Student {UserId} retrieving their assessments", userId);

            var result = await _assessmentService.GetMyAssessmentsAsync(userId);
            if (result == null)
                return NotFound(ApiResponse<StudentMyAssessmentsDto>.NotFound(
                    "Bạn chưa thuộc nhóm nào trong học kỳ hiện tại."));

            return Ok(ApiResponse<StudentMyAssessmentsDto>.Ok(result,
                "Lấy thông tin assessment thành công."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<StudentMyAssessmentsDto>.Unauthorized(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assessments for current user");
            return StatusCode(500, ApiResponse<StudentMyAssessmentsDto>.InternalError(ex.Message));
        }
    }

    // ---------------------------------------------------------------
    private int GetUserIdFromToken()
    {
        if (User.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập hoặc Token không hợp lệ.");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("Không tìm thấy UserId trong Token.");

        return int.Parse(userIdClaim);
    }
}
