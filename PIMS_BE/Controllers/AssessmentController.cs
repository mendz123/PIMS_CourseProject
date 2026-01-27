using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Assessment;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>
/// Controller for managing assessments (grading schemes)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN,SUBJECT_HEAD")]
public class AssessmentController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public AssessmentController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    /// <summary>
    /// Get all assessments for a semester
    /// </summary>
    [HttpGet("semester/{semesterId}")]
    public async Task<ActionResult<ApiResponse<List<AssessmentDto>>>> GetAssessmentsBySemester(int semesterId)
    {
        try
        {
            var assessments = await _assessmentService.GetAssessmentsBySemesterAsync(semesterId);
            return Ok(ApiResponse<List<AssessmentDto>>.Ok(assessments, "Assessments retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<AssessmentDto>>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Get all assessments with criteria for a semester
    /// </summary>
    [HttpGet("semester/{semesterId}/with-criteria")]
    public async Task<ActionResult<ApiResponse<List<AssessmentWithCriteriaDto>>>> GetAssessmentsWithCriteria(int semesterId)
    {
        try
        {
            var assessments = await _assessmentService.GetAssessmentsWithCriteriaAsync(semesterId);
            return Ok(ApiResponse<List<AssessmentWithCriteriaDto>>.Ok(assessments, "Assessments with criteria retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<AssessmentWithCriteriaDto>>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Get assessment by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AssessmentDto>>> GetAssessmentById(int id)
    {
        try
        {
            var assessment = await _assessmentService.GetAssessmentByIdAsync(id);
            if (assessment == null)
            {
                return NotFound(ApiResponse<AssessmentDto>.NotFound($"Assessment with ID {id} not found"));
            }

            return Ok(ApiResponse<AssessmentDto>.Ok(assessment, "Assessment retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AssessmentDto>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Get assessment with criteria by ID
    /// </summary>
    [HttpGet("{id}/with-criteria")]
    public async Task<ActionResult<ApiResponse<AssessmentWithCriteriaDto>>> GetAssessmentWithCriteria(int id)
    {
        try
        {
            var assessment = await _assessmentService.GetAssessmentWithCriteriaAsync(id);
            if (assessment == null)
            {
                return NotFound(ApiResponse<AssessmentWithCriteriaDto>.NotFound($"Assessment with ID {id} not found"));
            }

            return Ok(ApiResponse<AssessmentWithCriteriaDto>.Ok(assessment, "Assessment with criteria retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AssessmentWithCriteriaDto>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Create new assessment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<AssessmentDto>>> CreateAssessment([FromBody] CreateAssessmentDto dto)
    {
        try
        {
            // TODO: Get userId from authenticated user context
            int userId = 1; // Placeholder

            var assessment = await _assessmentService.CreateAssessmentAsync(dto, userId);
            return StatusCode(201, ApiResponse<AssessmentDto>.Created(assessment, "Assessment created successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<AssessmentDto>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<AssessmentDto>.BadRequest(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AssessmentDto>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Update assessment
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<AssessmentDto>>> UpdateAssessment(int id, [FromBody] UpdateAssessmentDto dto)
    {
        try
        {
            // TODO: Get userId from authenticated user context
            int userId = 1; // Placeholder

            var assessment = await _assessmentService.UpdateAssessmentAsync(id, dto, userId);
            return Ok(ApiResponse<AssessmentDto>.Ok(assessment, "Assessment updated successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<AssessmentDto>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<AssessmentDto>.BadRequest(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AssessmentDto>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Delete assessment
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteAssessment(int id)
    {
        try
        {
            // TODO: Get userId from authenticated user context
            int userId = 1; // Placeholder

            await _assessmentService.DeleteAssessmentAsync(id, userId);
            return Ok(ApiResponse<object>.Ok(new { }, "Assessment deleted successfully"));
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

    /// <summary>
    /// Lock assessment
    /// </summary>
    [HttpPost("{id}/lock")]
    public async Task<ActionResult<ApiResponse<object>>> LockAssessment(int id)
    {
        try
        {
            // TODO: Get userId from authenticated user context
            int userId = 1; // Placeholder

            await _assessmentService.LockAssessmentAsync(id, userId);
            return Ok(ApiResponse<object>.Ok(new { }, "Assessment locked successfully"));
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

    /// <summary>
    /// Unlock assessment
    /// </summary>
    [HttpPost("{id}/unlock")]
    public async Task<ActionResult<ApiResponse<object>>> UnlockAssessment(int id)
    {
        try
        {
            // TODO: Get userId from authenticated user context
            int userId = 1; // Placeholder

            await _assessmentService.UnlockAssessmentAsync(id, userId);
            return Ok(ApiResponse<object>.Ok(new { }, "Assessment unlocked successfully"));
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

    /// <summary>
    /// Validate assessment weights for a semester
    /// </summary>
    [HttpGet("semester/{semesterId}/validate-weights")]
    public async Task<ActionResult<ApiResponse<object>>> ValidateAssessmentWeights(int semesterId)
    {
        try
        {
            var isValid = await _assessmentService.ValidateAssessmentWeightsAsync(semesterId);
            
            if (isValid)
            {
                return Ok(ApiResponse<object>.Ok(new { isValid = true }, "Assessment weights are valid (total = 100%)"));
            }
            else
            {
                return BadRequest(ApiResponse<object>.BadRequest("Assessment weights do not equal 100%"));
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.InternalError(ex.Message));
        }
    }
}
