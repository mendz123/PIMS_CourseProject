using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.DefenseSchedule;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>UC23: Schedule Defense Session | UC24: Assign Room for Defense</summary>
[ApiController]
[Route("api/defense-schedule")]
[Authorize]
public class DefenseScheduleController : ControllerBase
{
    private readonly IDefenseScheduleService _scheduleService;

    public DefenseScheduleController(IDefenseScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    /// <summary>UC-NEW: Teacher views their own defense schedule (by council membership)</summary>
    [HttpGet("my-schedule")]
    [Authorize(Roles = "TEACHER")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DefenseScheduleDto>>>> GetMySchedule()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(ApiResponse<IEnumerable<DefenseScheduleDto>>.Unauthorized("Invalid token"));

            var result = await _scheduleService.GetByTeacherAsync(userId);
            return Ok(ApiResponse<IEnumerable<DefenseScheduleDto>>.Ok(result, "My defense schedules retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<DefenseScheduleDto>>.InternalError(ex.Message));
        }
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<DefenseScheduleDto>>>> GetAll(
        [FromQuery] int? semesterId,
        [FromQuery] int? councilId)
    {
        try
        {
            var result = await _scheduleService.GetAllAsync(semesterId, councilId);
            return Ok(ApiResponse<IEnumerable<DefenseScheduleDto>>.Ok(result, "Schedules retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<DefenseScheduleDto>>.InternalError(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DefenseScheduleDto>>> GetById(int id)
    {
        try
        {
            var result = await _scheduleService.GetByIdAsync(id);
            if (result == null)
                return NotFound(ApiResponse<DefenseScheduleDto>.NotFound($"Schedule {id} not found"));
            return Ok(ApiResponse<DefenseScheduleDto>.Ok(result, "Schedule retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<DefenseScheduleDto>.InternalError(ex.Message));
        }
    }

    // UC23 — Schedule defense session (HeadOfSubject only)
    [HttpPost]
    [Authorize(Roles = "SUBJECT_HEAD")]
    public async Task<ActionResult<ApiResponse<DefenseScheduleDto>>> Create(
        [FromBody] CreateDefenseScheduleDto dto)
    {
        try
        {
            var result = await _scheduleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.ScheduleId },
                ApiResponse<DefenseScheduleDto>.Ok(result, "Defense schedule created successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<DefenseScheduleDto>.NotFound(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<DefenseScheduleDto>.BadRequest(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<DefenseScheduleDto>.Conflict(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<DefenseScheduleDto>.InternalError(ex.Message));
        }
    }

    // UC23-BULK — Bulk schedule defense sessions (HeadOfSubject only)
    [HttpPost("bulk")]
    [Authorize(Roles = "SUBJECT_HEAD")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DefenseScheduleDto>>>> BulkCreate(
        [FromBody] BulkCreateDefenseScheduleDto dto)
    {
        try
        {
            var results = await _scheduleService.BulkCreateAsync(dto);
            return Ok(ApiResponse<IEnumerable<DefenseScheduleDto>>.Ok(
                results, $"{results.Count()} defense schedules created successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<IEnumerable<DefenseScheduleDto>>.NotFound(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<IEnumerable<DefenseScheduleDto>>.BadRequest(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<IEnumerable<DefenseScheduleDto>>.Conflict(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<DefenseScheduleDto>>.InternalError(ex.Message));
        }
    }

    // UC24 — Assign room to defense session (HeadOfSubject only)
    [HttpPatch("{id}/room")]
    [Authorize(Roles = "SUBJECT_HEAD")]
    public async Task<ActionResult<ApiResponse<DefenseScheduleDto>>> AssignRoom(
        int id, [FromBody] AssignRoomDto dto)
    {
        try
        {
            var result = await _scheduleService.AssignRoomAsync(id, dto);
            return Ok(ApiResponse<DefenseScheduleDto>.Ok(result, "Room assigned successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<DefenseScheduleDto>.NotFound(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<DefenseScheduleDto>.InternalError(ex.Message));
        }
    }
}
