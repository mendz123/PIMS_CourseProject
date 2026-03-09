using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Semester;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SemesterController : ControllerBase
{
    private readonly ISemesterService _semesterService;

    public SemesterController(ISemesterService semesterService)
    {
        _semesterService = semesterService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<SemesterDto>>>> GetAll()
    {
        try
        {
            var result = await _semesterService.GetAllSemestersAsync();
            return Ok(ApiResponse<IEnumerable<SemesterDto>>.Ok(result, "Semesters retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<SemesterDto>>.InternalError(ex.Message));
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<SemesterDto>>> GetActive()
    {
        try
        {
            var result = await _semesterService.GetActiveSemesterAsync();
            if (result == null)
                return NotFound(ApiResponse<SemesterDto>.NotFound("No active semester found"));
            return Ok(ApiResponse<SemesterDto>.Ok(result, "Active semester retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<SemesterDto>.InternalError(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<SemesterDto>>> GetById(int id)
    {
        try
        {
            var result = await _semesterService.GetByIdAsync(id);
            if (result == null)
                return NotFound(ApiResponse<SemesterDto>.NotFound($"Semester {id} not found"));
            return Ok(ApiResponse<SemesterDto>.Ok(result, "Semester retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<SemesterDto>.InternalError(ex.Message));
        }
    }

    // UC19 — Create Semester
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<SemesterDto>>> Create([FromBody] CreateSemesterDto dto)
    {
        try
        {
            var result = await _semesterService.CreateSemesterAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.SemesterId },
                ApiResponse<SemesterDto>.Ok(result, "Semester created successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<SemesterDto>.BadRequest(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<SemesterDto>.InternalError(ex.Message));
        }
    }

    // UC20 — Update Semester
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<SemesterDto>>> Update(int id, [FromBody] UpdateSemesterDto dto)
    {
        try
        {
            var result = await _semesterService.UpdateSemesterAsync(id, dto);
            return Ok(ApiResponse<SemesterDto>.Ok(result, "Semester updated successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<SemesterDto>.NotFound(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<SemesterDto>.BadRequest(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<SemesterDto>.InternalError(ex.Message));
        }
    }

    // UC — Delete Semester
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            await _semesterService.DeleteSemesterAsync(id);
            return NoContent();
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
            return StatusCode(500, ApiResponse<object>.InternalError(ex.Message));
        }
    }
}
