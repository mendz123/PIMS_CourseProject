using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Group;
using PIMS_BE.DTOs.Project;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;

namespace PIMS_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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
        [Authorize(Roles = "TEACHER,SUBJECT_HEAD,ADMIN")]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<GroupDto>>>> GetGroups(
            [FromQuery] string? search,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                bool isTeacher = User.IsInRole("TEACHER");
                int? filterByMentorId = null;
                bool includeMentorInfo = false;

                if (isTeacher)
                {
                    var userId = GetCurrentUserId();
                    if (userId == null) return UnauthorizedResponse<PaginatedResponse<GroupDto>>("User information not found.");
                    filterByMentorId = userId.Value;
                }
                else
                {
                    // SUBJECT_HEAD: see all groups with mentor info
                    includeMentorInfo = true;
                }

                var (items, totalCount) = await _groupService.GetGroupsAsync(search, pageNumber, pageSize, filterByMentorId, includeMentorInfo);
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

        [HttpGet("{groupId}")]
        [Authorize(Roles = "TEACHER,SUBJECT_HEAD")]
        public async Task<ActionResult<ApiResponse<GroupDetailDto>>> GetGroupDetail(int groupId)
        {
            try
            {
                var detail = await _groupService.GetGroupDetailAsync(groupId);
                if (detail == null)
                    return NotFoundResponse<GroupDetailDto>("Group not found.");

                return OkResponse(detail, "Get group detail successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<GroupDetailDto>(ex.Message);
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

        [HttpGet("my-group")]
        [Authorize(Roles = "STUDENT")]
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

        [HttpGet("my-group/detail")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<GroupDetailDto>>> GetMyGroupDetail()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<GroupDetailDto>("User information not found.");

                var detail = await _groupService.GetMyGroupDetailAsync(userId.Value);
                if (detail == null)
                    return OkResponse<GroupDetailDto?>(null, "You don't have a group in the current semester.");

                return OkResponse(detail, "Get group detail successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<GroupDetailDto>(ex.Message);
            }
        }

        [HttpPost]
        [Authorize(Roles = "STUDENT")]
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

        [HttpPost("{groupId}/invite")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<InvitationDto>>> InviteMember(int groupId, [FromBody] InviteMemberRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequestResponse<InvitationDto>("Invalid data.");

                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<InvitationDto>("User information not found.");

                var invitation = await _groupService.InviteMemberAsync(userId.Value, groupId, request.InvitedEmail);
                return OkResponse(invitation, $"Invitation sent to {request.InvitedEmail} successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<InvitationDto>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<InvitationDto>(ex.Message);
            }
        }

        [HttpGet("invitations/pending")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<List<InvitationDto>>>> GetPendingInvitations()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<List<InvitationDto>>("User information not found.");

                var invitations = await _groupService.GetPendingInvitationsAsync(userId.Value);
                return OkResponse(invitations, "Get pending invitations successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<List<InvitationDto>>(ex.Message);
            }
        }

        [HttpGet("invitations/{invitationId}/detail")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<InvitationDetailDto>>> GetInvitationDetail(int invitationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<InvitationDetailDto>("User information not found.");

                var detail = await _groupService.GetInvitationDetailAsync(userId.Value, invitationId);
                if (detail == null)
                    return NotFoundResponse<InvitationDetailDto>("Invitation not found or you don't have permission to view it.");

                return OkResponse(detail, "Get invitation detail successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<InvitationDetailDto>(ex.Message);
            }
        }

        [HttpPost("invitations/{invitationId}/accept")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<GroupDto>>> AcceptInvitation(int invitationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<GroupDto>("User information not found.");

                var group = await _groupService.RespondToInvitationAsync(userId.Value, invitationId, accept: true);
                return OkResponse(group, "You have successfully joined the group.");
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

        [HttpPost("invitations/{invitationId}/reject")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<string>>> RejectInvitation(int invitationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<string>("User information not found.");

                await _groupService.RespondToInvitationAsync(userId.Value, invitationId, accept: false);
                return OkResponse("Rejected", "Invitation rejected.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<string>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<string>(ex.Message);
            }
        }

        // ??? Mentor Request Endpoints ???????????????????????????????????????????

        [HttpPost("{groupId}/invite-mentor")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<MentorRequestDto>>> InviteMentor(int groupId, [FromBody] InviteMentorRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequestResponse<MentorRequestDto>("Invalid data.");

                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<MentorRequestDto>("User information not found.");

                var result = await _groupService.SendMentorInvitationAsync(userId.Value, groupId, request.MentorEmail, request.Message);
                return OkResponse(result, $"Mentor invitation sent to {request.MentorEmail} successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<MentorRequestDto>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<MentorRequestDto>(ex.Message);
            }
        }

        [HttpGet("mentor-requests/pending")]
        [Authorize(Roles = "TEACHER")]
        public async Task<ActionResult<ApiResponse<List<MentorRequestDto>>>> GetPendingMentorRequests()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<List<MentorRequestDto>>("User information not found.");

                var requests = await _groupService.GetPendingMentorRequestsAsync(userId.Value);
                return OkResponse(requests, "Get pending mentor requests successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<List<MentorRequestDto>>(ex.Message);
            }
        }

        [HttpGet("mentor-requests/{requestId}/detail")]
        [Authorize(Roles = "TEACHER")]
        public async Task<ActionResult<ApiResponse<MentorRequestDetailDto>>> GetMentorRequestDetail(int requestId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<MentorRequestDetailDto>("User information not found.");

                var detail = await _groupService.GetMentorRequestDetailAsync(userId.Value, requestId);
                if (detail == null)
                    return NotFoundResponse<MentorRequestDetailDto>("Mentor request not found or you don't have permission to view it.");

                return OkResponse(detail, "Get mentor request detail successfully.");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<MentorRequestDetailDto>(ex.Message);
            }
        }

        [HttpPost("mentor-requests/{requestId}/accept")]
        [Authorize(Roles = "TEACHER")]
        public async Task<ActionResult<ApiResponse<GroupDto>>> AcceptMentorRequest(int requestId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<GroupDto>("User information not found.");

                var group = await _groupService.RespondToMentorRequestAsync(userId.Value, requestId, accept: true);
                return OkResponse(group, "You have accepted to be the mentor of this group.");
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

        [HttpPost("mentor-requests/{requestId}/reject")]
        [Authorize(Roles = "TEACHER")]
        public async Task<ActionResult<ApiResponse<string>>> RejectMentorRequest(int requestId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<string>("User information not found.");

                await _groupService.RespondToMentorRequestAsync(userId.Value, requestId, accept: false);
                return OkResponse("Rejected", "Mentor request rejected.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<string>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<string>(ex.Message);
            }
        }

        // ??? Topic Registration Endpoints ????????????????????????????????????????

        [HttpPost("{groupId}/register-topic")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> RegisterTopic(int groupId, [FromBody] RegisterTopicRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequestResponse<ProjectDto>("Invalid data.");

                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<ProjectDto>("User information not found.");

                var result = await _groupService.RegisterTopicAsync(userId.Value, groupId, request);
                return CreatedResponse(result, "Topic registered successfully. Awaiting mentor approval.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<ProjectDto>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<ProjectDto>(ex.Message);
            }
        }

        [HttpPut("{groupId}/update-topic")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> UpdateTopic(int groupId, [FromBody] RegisterTopicRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequestResponse<ProjectDto>("Invalid data.");

                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<ProjectDto>("User information not found.");

                var result = await _groupService.UpdateTopicAsync(userId.Value, groupId, request);
                return OkResponse(result, "Topic updated successfully. Awaiting mentor approval.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<ProjectDto>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<ProjectDto>(ex.Message);
            }
        }

        [HttpPost("leave")]
        [Authorize(Roles = "STUDENT")]
        public async Task<ActionResult<ApiResponse<string>>> LeaveGroup()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<string>("User information not found.");

                await _groupService.LeaveGroupAsync(userId.Value);
                return OkResponse("Left", "You have successfully left the group.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestResponse<string>(ex.Message);
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<string>(ex.Message);
            }
        }

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
