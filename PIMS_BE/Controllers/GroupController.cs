using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Group;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;

namespace PIMS_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "STUDENT,TEACHER")]
    public class GroupController : BaseApiController
    {
        private readonly IGroupService _groupService;
        private readonly IAssessmentService _assessmentService;
        private readonly ISemesterService _semesterService;

        public GroupController(IGroupService groupService, IAssessmentService assessmentService, ISemesterService semesterService)
        {
            _groupService = groupService;
            _assessmentService = assessmentService;
            _semesterService = semesterService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<GroupDto>>>> GetGroups(
            [FromQuery] string? search,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var (items, totalCount) = await _groupService.GetGroupsAsync(search, pageNumber, pageSize);
                return OkPaginated(items, totalCount, pageNumber, pageSize, "Get list of groups successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<PaginatedResponse<GroupDto>>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<PaginatedResponse<GroupDto>>(ex.Message);
            }
        }

        [HttpGet("my-group-as-teacher")]
        public async Task<ActionResult<ApiResponse<List<TeacherGroupDto>>>> GetMyGroupsAsTeacher([FromQuery] int? semesterId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<List<TeacherGroupDto>>("User information not found.");

                var groups = await _groupService.GetGroupsByTeacherAsync(userId.Value, semesterId);
                return OkResponse(groups, "Get assigned groups for teacher successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<List<TeacherGroupDto>>(ex.Message);
            }
        }

        [HttpGet("my-group")]
        public async Task<ActionResult<ApiResponse<GroupDto>>> GetMyGroup()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<GroupDto>("User information not found.");

                var group = await _groupService.GetMyGroupAsync(userId.Value);
                if (group == null)
                    return OkResponse<GroupDto?>(null, "You don't have a group in the current semester.");

                return OkResponse(group, "Get information of group successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<GroupDto>(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<GroupDto>>> CreateGroup([FromBody] CreateGroupRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequestResponse<GroupDto>("Invalid data.");

                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<GroupDto>("User information not found..");

                var group = await _groupService.CreateGroupAsync(userId.Value, request.GroupName);
                return CreatedResponse(group, $"Create group '{group.GroupName}' successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<GroupDto>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<GroupDto>(ex.Message);
            }
        }

        [HttpGet("active-assessment")]
        public async Task<ActionResult<ApiResponse<List<PIMS_BE.DTOs.Assessment.AssessmentDto>>>> GetActiveAssessments()
        {
            try
            {
                var activeSemester = await _semesterService.GetActiveSemesterAsync();
                if (activeSemester == null)
                    return BadRequestResponse<List<PIMS_BE.DTOs.Assessment.AssessmentDto>>("No active semester found.");

                var result = await _assessmentService.GetAssessmentsBySemesterAsync(activeSemester.SemesterId);
                return OkResponse(result, "Get active assessments successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<List<PIMS_BE.DTOs.Assessment.AssessmentDto>>(ex.Message);
            }
        }

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
