using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

[Authorize]
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
}
