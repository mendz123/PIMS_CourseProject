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

    /// <summary>
    /// Get list of teachers
    /// </summary>
    [HttpGet("teachers")]
    [Authorize(Roles = "ADMIN,SUBJECT HEAD")]
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
    
}
