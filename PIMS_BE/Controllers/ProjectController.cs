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

        //[HttpPost("submit")]
        //public async Task<IActionResult> Submit(SubmitProjectDto dto)
        //{
        //    var claim = User.FindFirst(ClaimTypes.NameIdentifier); // Hàm lấy Id từ JWT
        //    if (claim == null || !int.TryParse(claim.Value, out var userId))
        //    {
        //        return Unauthorized(new { Success = false, Message = "Invalid or missing user id in token." });
        //    }

        //    var result = await _projectService.SubmitReportAsync(dto, userId);
        //    return result.Success ? Ok(result) : BadRequest(result);
        //}

        //[HttpPut("update/{id}")]
        //public async Task<IActionResult> Update(int id, SubmitProjectDto dto)
        //{
        //    var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        //    if (claim == null || !int.TryParse(claim.Value, out var userId))
        //    {
        //        return Unauthorized(new { Success = false, Message = "Invalid or missing user id in token." });
        //    }

        //    var result = await _projectService.UpdateSubmissionAsync(id, dto, userId);
        //    return result.Success ? Ok(result) : BadRequest(result);
        //}

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

