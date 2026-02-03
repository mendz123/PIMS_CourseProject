using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs.Project;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;

namespace PIMS_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "STUDENT")]
    public class ProjectController : Controller
    {

        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

       

        [HttpGet("my-project")]
        public async Task<IActionResult> GetMyProject()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out var userId))
            {
                return Unauthorized(new { Success = false, Message = "Không tìm thấy thông tin người dùng." });
            }

            var result = await _projectService.GetProjectByStudentIdAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("withdraw/{id}")]
        public async Task<IActionResult> Withdraw(int id)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out var userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid or missing user id in token." });
            }

            var result = await _projectService.WithdrawSubmissionAsync(id, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}

