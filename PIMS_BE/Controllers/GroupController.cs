using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.Repositories;

namespace PIMS_BE.Controllers;

/// <summary>Get group list for defense schedule assignment</summary>
[ApiController]
[Route("api/group")]
[Authorize]
public class GroupController : ControllerBase
{
    private readonly IGroupRepository _groupRepo;

    public GroupController(IGroupRepository groupRepo)
    {
        _groupRepo = groupRepo;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetAll(
        [FromQuery] int? semesterId)
    {
        try
        {
            var groups = await _groupRepo.GetAllAsync();

            var result = groups
                .Where(g => !semesterId.HasValue || g.SemesterId == semesterId.Value)
                .OrderBy(g => g.GroupName)
                .Select(g => new
                {
                    g.GroupId,
                    g.GroupName,
                    g.SemesterId
                });

            return Ok(ApiResponse<IEnumerable<object>>.Ok(result, "Groups retrieved"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<object>>.InternalError(ex.Message));
        }
    }
}
