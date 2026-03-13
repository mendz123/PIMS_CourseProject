using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs.Dashboard;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PIMS_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Có thể thêm Roles = "Lecturer, Teacher" nếu cần
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("teacher-overview")]
        public async Task<ActionResult<TeacherOverviewDto>> GetTeacherOverview()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int teacherId))
            {
                return Unauthorized();
            }

            var overview = await _dashboardService.GetTeacherOverviewAsync(teacherId);
            return Ok(new { success = true, message = "Teacher dashboard overview retrieved successfully.", data = overview });
        }
    }
}
