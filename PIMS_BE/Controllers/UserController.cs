using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.DTOs.User;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : BaseApiController
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserInfo>>> getUserById(int id) {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<UserInfo>.NotFound("User not found"));
            }
            return Ok(ApiResponse<UserInfo>.Ok(user, "User retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<UserInfo>.InternalError("Internal Server Error: " + ex.Message));
        }
    }

    /// getAllUsers
    [HttpGet]
    // [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<List<UserInfo>>>> GetAllUsers(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null)
    {
        try
        {
            PagedResult<UserInfo> users = await _userService.GetUsersPagedAsync(pageIndex, pageSize, search, role, status);
            return Ok(ApiResponse<PagedResult<UserInfo>>.Ok(users, "Users retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<PagedResult<UserInfo>>.InternalError("Internal Server Error: " + ex.Message));
        }
    }

    /// <summary>
    /// Get list of teachers
    /// </summary>
    [HttpGet("teachers")]
    [Authorize(Roles = "ADMIN,SUBJECT_HEAD")]
    public async Task<ActionResult<ApiResponse<List<UserInfo>>>> GetTeachers()
    {
        try
        {
            var teachers = await _userService.GetTeachersAsync();
            return Ok(ApiResponse<List<UserInfo>>.Ok(teachers, "Teachers retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<UserInfo>>.InternalError("Internal Server Error: " + ex.Message));
        }
    }

    /// <summary>
    /// Get lecturer summary including mentoring groups and defense council groups
    /// </summary>
    [HttpGet("lecturers/summary")]
    [Authorize(Roles = "ADMIN,SUBJECT_HEAD")]
    public async Task<ActionResult<ApiResponse<List<LecturerSummaryDto>>>> GetLecturersSummary([FromQuery] int? semesterId)
    {
        try
        {
            var result = await _userService.GetLecturersSummaryAsync(semesterId);
            return Ok(ApiResponse<List<LecturerSummaryDto>>.Ok(result, "Lecturers summary retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<LecturerSummaryDto>>.InternalError("Internal Server Error: " + ex.Message));
        }
    }

    // update profile
    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserInfo>>> UpdateProfile([FromForm] UpdateProfileRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<UserInfo>.Unauthorized("Invalid user ID in token"));
            }

            var user = await _userService.UpdateUserByIdAsync(request, userId);
            if (user == null)
            {
                return NotFound(ApiResponse<UserInfo>.NotFound("User not found"));
            }

            return Ok(ApiResponse<UserInfo>.Ok(user, "Profile updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<UserInfo>.InternalError("Internal Server Error: " + ex.Message));
        }
    }
    
    [HttpPost("me/change-password")]
    [Authorize]
    public async  Task<ActionResult<ApiResponse<UserInfo>>> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<UserInfo>.Unauthorized("Invalid user ID in token"));
            }

            var user = await _userService.ChangePasswordAsync(request, userId);
            if (user == null)
            {
                return NotFound(ApiResponse<UserInfo>.NotFound("User not found"));
            }

            return Ok(ApiResponse<UserInfo>.Ok(user, "Password changed successfully"));
        } catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<UserInfo>.InternalError("Internal Server Error: " + ex.Message));
        }
    }
    
    [HttpPatch("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<UserInfo>>> PatchUser(int id, [FromBody] AdminUpdateUserRequestDto request)
    {
        try
        {
            var user = await _userService.PatchUserAsync(id, request);
            if (user == null)
            {
                return NotFound(ApiResponse<UserInfo>.NotFound("User not found"));
            }
            return Ok(ApiResponse<UserInfo>.Ok(user, "User updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<UserInfo>.InternalError("Internal Server Error: " + ex.Message));
        }
    }

    [HttpGet("suggest")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<List<UserSuggestionDto>>>> SuggestUsers(
        [FromQuery] string q,
        [FromQuery] string role)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(ApiResponse<List<UserSuggestionDto>>.Ok(new List<UserSuggestionDto>(), "No query provided."));
        try
        {
            var suggestions = await _userService.SearchUserSuggestionsAsync(q.Trim(), role, 5);
            return Ok(ApiResponse<List<UserSuggestionDto>>.Ok(suggestions, "Suggestions retrieved."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<UserSuggestionDto>>.InternalError("Internal Server Error: " + ex.Message));
        }
    }

    [HttpPost("import-students")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<List<UserInfo>>>> ImportStudents([FromForm] ImportStudentRequest request)
    {
        var file = request.File;
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<List<UserInfo>>.BadRequest("No file uploaded."));
        try
        {
            var importedUsers = await _userService.ImportStudentListAsync(file);
            return Ok(ApiResponse<List<UserInfo>>.Ok(importedUsers, "Students imported successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<UserInfo>>.InternalError("Internal Server Error: " + ex.Message));
        }
    }
}

