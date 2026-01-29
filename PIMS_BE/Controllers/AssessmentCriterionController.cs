using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Assessment;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>
/// Controller for managing assessment criteria (assignment criteria)
/// </summary>
[ApiController]
[Route("api/assessments/{assessmentId}/criteria")]
[Authorize(Roles = "ADMIN,SUBJECT_HEAD")]
public class AssessmentCriterionController : ControllerBase
{
    private readonly IAssessmentCriterionService _criterionService;
    private readonly ILogger<AssessmentCriterionController> _logger;

    public AssessmentCriterionController(IAssessmentCriterionService criterionService, ILogger<AssessmentCriterionController> logger)
    {
        _criterionService = criterionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all criteria for an assessment
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AssessmentCriterionDto>>>> GetCriteriaByAssessmentId(int assessmentId)
    {
        try
        {
            var criteria = await _criterionService.GetCriteriaByAssessmentIdAsync(assessmentId);
            return Ok(ApiResponse<List<AssessmentCriterionDto>>.Ok(criteria, "Criteria retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<AssessmentCriterionDto>>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Get criterion by ID
    /// </summary>
    [HttpGet("{criteriaId}", Name = "GetCriterionById")]
    public async Task<ActionResult<ApiResponse<AssessmentCriterionDto>>> GetCriterionById(int assessmentId, int criteriaId)
    {
        try
        {
            var criterion = await _criterionService.GetCriterionByIdAsync(criteriaId);
            if (criterion == null)
            {
                return NotFound(ApiResponse<AssessmentCriterionDto>.NotFound($"Criterion with ID {criteriaId} not found"));
            }

            // Validate that criterion belongs to the specified assessment
            if (criterion.AssessmentId != assessmentId)
            {
                return BadRequest(ApiResponse<AssessmentCriterionDto>.BadRequest(
                    $"Criterion {criteriaId} does not belong to assessment {assessmentId}"));
            }

            return Ok(ApiResponse<AssessmentCriterionDto>.Ok(criterion, "Criterion retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AssessmentCriterionDto>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Create a new criterion for an assessment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<AssessmentCriterionDto>>> CreateCriterion(
        int assessmentId, [FromBody] CreateCriterionDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<AssessmentCriterionDto>.Unauthorized("Invalid user authentication"));
            }

            var criterion = await _criterionService.CreateCriterionAsync(assessmentId, dto, userId);
            return StatusCode(201, ApiResponse<AssessmentCriterionDto>.Created(criterion, "Criterion created successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<AssessmentCriterionDto>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<AssessmentCriterionDto>.BadRequest(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AssessmentCriterionDto>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Create multiple criteria at once (batch operation)
    /// This will replace all existing criteria with the new ones
    /// </summary>
    [HttpPost("batch")]
    public async Task<ActionResult<ApiResponse<List<AssessmentCriterionDto>>>> CreateMultipleCriteria(
        int assessmentId, [FromBody] BatchCreateCriteriaDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<List<AssessmentCriterionDto>>.Unauthorized("Invalid user authentication"));
            }
            var userName = User.Identity?.Name ?? "Unknown";

            _logger.LogInformation("User {UserName} (ID: {UserId}) creating {Count} criteria for assessment {AssessmentId} (batch operation)",
                userName, userId, dto.Criteria.Count, assessmentId);

            var criteria = await _criterionService.CreateMultipleCriteriaAsync(assessmentId, dto.Criteria, userId);
            
            _logger.LogInformation("{Count} criteria created successfully for assessment {AssessmentId} by user {UserName}",
                criteria.Count, assessmentId, userName);
            
            return StatusCode(201, ApiResponse<List<AssessmentCriterionDto>>.Created(criteria, "Criteria created successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Batch create criteria failed for assessment {AssessmentId} - not found", assessmentId);
            return NotFound(ApiResponse<List<AssessmentCriterionDto>>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Batch create criteria failed for assessment {AssessmentId}: {Message}", assessmentId, ex.Message);
            return BadRequest(ApiResponse<List<AssessmentCriterionDto>>.BadRequest(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating criteria for assessment {AssessmentId}", assessmentId);
            return StatusCode(500, ApiResponse<List<AssessmentCriterionDto>>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Update a criterion
    /// </summary>
    [HttpPut("{criteriaId}")]
    public async Task<ActionResult<ApiResponse<AssessmentCriterionDto>>> UpdateCriterion(
        int assessmentId, int criteriaId, [FromBody] UpdateCriterionDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<AssessmentCriterionDto>.Unauthorized("Invalid user authentication"));
            }

            var criterion = await _criterionService.UpdateCriterionAsync(criteriaId, dto, userId);

            // Validate that criterion belongs to the specified assessment
            if (criterion.AssessmentId != assessmentId)
            {
                return BadRequest(ApiResponse<AssessmentCriterionDto>.BadRequest(
                    $"Criterion {criteriaId} does not belong to assessment {assessmentId}"));
            }

            return Ok(ApiResponse<AssessmentCriterionDto>.Ok(criterion, "Criterion updated successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<AssessmentCriterionDto>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<AssessmentCriterionDto>.BadRequest(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<AssessmentCriterionDto>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Delete a criterion
    /// </summary>
    [HttpDelete("{criteriaId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCriterion(int assessmentId, int criteriaId)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<object>.Unauthorized("Invalid user authentication"));
            }

            await _criterionService.DeleteCriterionAsync(criteriaId, userId);
            return Ok(ApiResponse<object>.Ok(new { }, "Criterion deleted successfully"));
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
    /// Validate criteria weights for an assessment
    /// </summary>
    [HttpGet("validate-weights")]
    public async Task<ActionResult<ApiResponse<object>>> ValidateCriteriaWeights(int assessmentId)
    {
        try
        {
            var isValid = await _criterionService.ValidateCriteriaWeightsAsync(assessmentId);
            
            if (isValid)
            {
                return Ok(ApiResponse<object>.Ok(new { isValid = true }, "Criteria weights are valid (total = 100%)"));
            }
            else
            {
                return BadRequest(ApiResponse<object>.BadRequest("Criteria weights do not equal 100%"));
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.InternalError(ex.Message));
        }
    }
}
