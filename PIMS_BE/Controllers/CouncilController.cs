using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Council;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>UC21: Create Defense Council | UC22: Update Defense Council</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CouncilController : ControllerBase
{
    private readonly ICouncilService _councilService;

    public CouncilController(ICouncilService councilService)
    {
        _councilService = councilService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CouncilDto>>>> GetAll(
        [FromQuery] int? semesterId)
    {
        try
        {
            var result = await _councilService.GetAllAsync(semesterId);
            return Ok(ApiResponse<IEnumerable<CouncilDto>>.Ok(result, "Councils retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<CouncilDto>>.InternalError(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CouncilDto>>> GetById(int id)
    {
        try
        {
            var result = await _councilService.GetByIdAsync(id);
            if (result == null)
                return NotFound(ApiResponse<CouncilDto>.NotFound($"Council {id} not found"));
            return Ok(ApiResponse<CouncilDto>.Ok(result, "Council retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CouncilDto>.InternalError(ex.Message));
        }
    }

    // UC21 — Create defense council (HeadOfSubject only)
    [HttpPost]
    [Authorize(Roles = "SUBJECT_HEAD")]
    public async Task<ActionResult<ApiResponse<CouncilDto>>> Create([FromBody] CreateCouncilDto dto)
    {
        try
        {
            var result = await _councilService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.CouncilId },
                ApiResponse<CouncilDto>.Ok(result, "Council created successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<CouncilDto>.NotFound(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CouncilDto>.InternalError(ex.Message));
        }
    }

    // UC22 — Update defense council (HeadOfSubject only)
    [HttpPut("{id}")]
    [Authorize(Roles = "SUBJECT_HEAD")]
    public async Task<ActionResult<ApiResponse<CouncilDto>>> Update(
        int id, [FromBody] UpdateCouncilDto dto)
    {
        try
        {
            var result = await _councilService.UpdateAsync(id, dto);
            return Ok(ApiResponse<CouncilDto>.Ok(result, "Council updated successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<CouncilDto>.NotFound(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CouncilDto>.InternalError(ex.Message));
        }
    }

    // Delete defense council (HeadOfSubject only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "SUBJECT_HEAD")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            await _councilService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.NotFound(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.InternalError(ex.Message));
        }
    }
}
