using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs.Class;
using PIMS_BE.DTOs;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers
{
    [Authorize]
    public class ClassController : BaseApiController
    {
        private readonly IClassService _classService;

        public ClassController(IClassService classService)
        {
            _classService = classService;
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN,SUBJECT HEAD")]
        public async Task<ActionResult<ApiResponse<List<ClassDto>>>> GetClasses()
        {
            try
            {
                var classes = await _classService.GetClassesAsync();
                return Ok(ApiResponse<List<ClassDto>>.Ok(classes, "Classes retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<List<ClassDto>>.InternalError("Internal Server Error: " + ex.Message));
            }
        }

        [HttpPut("assign-teacher")]
        [Authorize(Roles = "ADMIN,SUBJECT HEAD")]
        public async Task<ActionResult<ApiResponse<object>>> AssignTeacher([FromBody] AssignTeacherDto dto)
        {
            try
            {
                var result = await _classService.AssignTeacherToClassAsync(dto.ClassId, dto.TeacherId);
                if (result)
                {
                    return Ok(ApiResponse<object>.Ok(new object(), "Teacher assigned successfully"));
                }
                return BadRequest(ApiResponse<object>.BadRequest("Failed to assign teacher"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.NotFound(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.BadRequest(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.InternalError("Internal Server Error: " + ex.Message));
            }
        }
    }
}
