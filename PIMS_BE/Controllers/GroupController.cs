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
    [Authorize(Roles = "STUDENT")]
    public class GroupController : BaseApiController
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpGet("my-group")]
        public async Task<ActionResult<ApiResponse<GroupDto>>> GetMyGroup()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<GroupDto>("Không tìm th?y thông tin ng??i dùng.");

                var group = await _groupService.GetMyGroupAsync(userId.Value);
                if (group == null)
                    return OkResponse<GroupDto?>(null, "B?n ch?a có nhóm trong h?c k? hi?n t?i.");

                return OkResponse(group, "L?y thông tin nhóm thành công.");
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
                    return BadRequestResponse<GroupDto>("D? li?u không h?p l?.");

                var userId = GetCurrentUserId();
                if (userId == null) return UnauthorizedResponse<GroupDto>("Không tìm th?y thông tin ng??i dùng.");

                var group = await _groupService.CreateGroupAsync(userId.Value, request.GroupName);
                return CreatedResponse(group, $"T?o nhóm '{group.GroupName}' thành công.");
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

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
