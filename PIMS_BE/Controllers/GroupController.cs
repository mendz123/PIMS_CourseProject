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
    [Authorize]
    public class GroupController : BaseApiController
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpGet]
        [Authorize(Roles = "TEACHER,SUBJECT_HEAD")]
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

                var invitation = await _groupService.InviteMemberAsync(userId.Value, groupId, request.InvitedUserId);
                return OkResponse(invitation, $"?ã g?i l?i m?i ??n ng??i dùng ID {request.InvitedUserId} thành công.");
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
                return OkResponse(invitations, "L?y danh sách l?i m?i thành công.");
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
                    return NotFoundResponse<InvitationDetailDto>("L?i m?i không t?n t?i ho?c b?n không có quy?n xem.");

                return OkResponse(detail, "L?y chi ti?t l?i m?i thành công.");
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
                return OkResponse(group, "B?n ?ã ch?p nh?n l?i m?i và tham gia nhóm thành công.");
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
                return OkResponse("Rejected", "B?n ?ã t? ch?i l?i m?i.");
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
