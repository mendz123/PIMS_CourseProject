using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.Repositories;

namespace PIMS_BE.Controllers;

/// <summary>
/// Controller for managing semesters
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SemesterController : ControllerBase
{
    private readonly ISemesterRepository _semesterRepository;

    public SemesterController(ISemesterRepository semesterRepository)
    {
        _semesterRepository = semesterRepository;
    }

    /// <summary>
    /// Get all semesters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SemesterDto>>>> GetAllSemesters()
    {
        try
        {
            var semesters = await _semesterRepository.GetAllAsync();
            var semesterDtos = semesters
                .OrderByDescending(s => s.IsActive)
                .ThenByDescending(s => s.StartDate)
                .Select(s => new SemesterDto
                {
                    SemesterId = s.SemesterId,
                    SemesterName = s.SemesterName,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    IsActive = s.IsActive
                })
                .ToList();

            return Ok(ApiResponse<List<SemesterDto>>.Ok(semesterDtos, "Semesters retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<SemesterDto>>.InternalError(ex.Message));
        }
    }

    /// <summary>
    /// Get active semester
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<SemesterDto>>> GetActiveSemester()
    {
        try
        {
            var semesters = await _semesterRepository.GetAllAsync();
            var activeSemester = semesters.FirstOrDefault(s => s.IsActive == true);

            if (activeSemester == null)
            {
                return NotFound(ApiResponse<SemesterDto>.NotFound("No active semester found"));
            }

            var semesterDto = new SemesterDto
            {
                SemesterId = activeSemester.SemesterId,
                SemesterName = activeSemester.SemesterName,
                StartDate = activeSemester.StartDate,
                EndDate = activeSemester.EndDate,
                IsActive = activeSemester.IsActive
            };

            return Ok(ApiResponse<SemesterDto>.Ok(semesterDto, "Active semester retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<SemesterDto>.InternalError(ex.Message));
        }
    }
}

public class SemesterDto
{
    public int SemesterId { get; set; }
    public string? SemesterName { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool? IsActive { get; set; }
}
