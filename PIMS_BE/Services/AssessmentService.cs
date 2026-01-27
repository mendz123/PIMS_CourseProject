using PIMS_BE.DTOs.Assessment;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Services;

public class AssessmentService : IAssessmentService
{
    private readonly IAssessmentRepository _assessmentRepository;
    private readonly IAssessmentCriterionRepository _criterionRepository;
    private readonly ISemesterRepository _semesterRepository;

    public AssessmentService(
        IAssessmentRepository assessmentRepository,
        IAssessmentCriterionRepository criterionRepository,
        ISemesterRepository semesterRepository)
    {
        _assessmentRepository = assessmentRepository;
        _criterionRepository = criterionRepository;
        _semesterRepository = semesterRepository;
    }

    public async Task<AssessmentDto> CreateAssessmentAsync(CreateAssessmentDto dto, int userId)
    {
        // Validate semester exists
        var semester = await _semesterRepository.GetByIdAsync(dto.SemesterId);
        if (semester == null)
        {
            throw new KeyNotFoundException($"Semester with ID {dto.SemesterId} not found");
        }

        // Validate total weight
        var currentTotalWeight = await _assessmentRepository.GetTotalWeightBySemesterAsync(dto.SemesterId);
        if (currentTotalWeight + dto.Weight > 100)
        {
            throw new InvalidOperationException(
                $"Total assessment weight exceeds 100%. Current: {currentTotalWeight}%, Attempting to add: {dto.Weight}%");
        }

        var assessment = new Assessment
        {
            SemesterId = dto.SemesterId,
            Title = dto.Title,
            Weight = dto.Weight,
            IsFinal = dto.IsFinal,
            IsLocked = false,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _assessmentRepository.AddAsync(assessment);
        await _assessmentRepository.SaveChangesAsync();

        return await MapToDto(assessment);
    }

    public async Task<AssessmentDto> UpdateAssessmentAsync(int assessmentId, UpdateAssessmentDto dto, int userId)
    {
        var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        // Check if locked
        if (assessment.IsLocked == true && dto.Weight.HasValue)
        {
            throw new InvalidOperationException("Cannot modify weight of a locked assessment");
        }

        // Validate weight if being updated
        if (dto.Weight.HasValue)
        {
            var currentTotalWeight = await _assessmentRepository
                .GetTotalWeightBySemesterAsync(assessment.SemesterId, assessmentId);

            if (currentTotalWeight + dto.Weight.Value > 100)
            {
                throw new InvalidOperationException(
                    $"Total assessment weight would exceed 100%. Current (excluding this): {currentTotalWeight}%, New value: {dto.Weight.Value}%");
            }

            assessment.Weight = dto.Weight.Value;
        }

        if (!string.IsNullOrEmpty(dto.Title))
        {
            assessment.Title = dto.Title;
        }

        if (dto.IsFinal.HasValue)
        {
            assessment.IsFinal = dto.IsFinal.Value;
        }

        if (dto.IsLocked.HasValue)
        {
            assessment.IsLocked = dto.IsLocked.Value;
        }

        _assessmentRepository.Update(assessment);
        await _assessmentRepository.SaveChangesAsync();

        return await MapToDto(assessment);
    }

    public async Task DeleteAssessmentAsync(int assessmentId, int userId)
    {
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        // Check if has scores
        var hasScores = await _assessmentRepository.HasScoresAsync(assessmentId);
        if (hasScores)
        {
            throw new InvalidOperationException("Cannot delete assessment with existing scores");
        }

        // Delete all criteria first
        await _criterionRepository.DeleteByAssessmentIdAsync(assessmentId);

        _assessmentRepository.Remove(assessment);
        await _assessmentRepository.SaveChangesAsync();
    }

    public async Task<AssessmentDto?> GetAssessmentByIdAsync(int assessmentId)
    {
        var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(assessmentId);
        if (assessment == null)
        {
            return null;
        }

        return await MapToDto(assessment);
    }

    public async Task<List<AssessmentDto>> GetAssessmentsBySemesterAsync(int semesterId)
    {
        var assessments = await _assessmentRepository.GetAssessmentsBySemesterAsync(semesterId);
        var dtos = new List<AssessmentDto>();

        foreach (var assessment in assessments)
        {
            dtos.Add(await MapToDto(assessment));
        }

        return dtos;
    }

    public async Task<AssessmentWithCriteriaDto?> GetAssessmentWithCriteriaAsync(int assessmentId)
    {
        var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(assessmentId);
        if (assessment == null)
        {
            return null;
        }

        return MapToWithCriteriaDto(assessment);
    }

    public async Task<List<AssessmentWithCriteriaDto>> GetAssessmentsWithCriteriaAsync(int semesterId)
    {
        var assessments = await _assessmentRepository.GetAssessmentsWithCriteriaAsync(semesterId);
        return assessments.Select(MapToWithCriteriaDto).ToList();
    }

    public async Task LockAssessmentAsync(int assessmentId, int userId)
    {
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        assessment.IsLocked = true;
        _assessmentRepository.Update(assessment);
        await _assessmentRepository.SaveChangesAsync();
    }

    public async Task UnlockAssessmentAsync(int assessmentId, int userId)
    {
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        assessment.IsLocked = false;
        _assessmentRepository.Update(assessment);
        await _assessmentRepository.SaveChangesAsync();
    }

    public async Task<bool> ValidateAssessmentWeightsAsync(int semesterId, int? excludeAssessmentId = null)
    {
        var totalWeight = await _assessmentRepository
            .GetTotalWeightBySemesterAsync(semesterId, excludeAssessmentId);
        return totalWeight == 100m;
    }

    private Task<AssessmentDto> MapToDto(Assessment assessment)
    {
        return Task.FromResult(new AssessmentDto
        {
            AssessmentId = assessment.AssessmentId,
            SemesterId = assessment.SemesterId,
            Title = assessment.Title ?? string.Empty,
            Weight = assessment.Weight ?? 0,
            IsFinal = assessment.IsFinal ?? false,
            IsLocked = assessment.IsLocked ?? false,
            CreatedBy = assessment.CreatedBy,
            CreatedAt = assessment.CreatedAt ?? DateTime.UtcNow,
            CreatedByName = assessment.CreatedByNavigation?.FullName ?? "Unknown",
            Criteria = assessment.AssessmentCriteria?.Select(c => new AssessmentCriterionDto
            {
                CriteriaId = c.CriteriaId,
                AssessmentId = c.AssessmentId,
                CriteriaName = c.CriteriaName ?? string.Empty,
                Weight = c.Weight ?? 0
            }).ToList()
        });
    }

    private AssessmentWithCriteriaDto MapToWithCriteriaDto(Assessment assessment)
    {
        var criteria = assessment.AssessmentCriteria.Select(c => new AssessmentCriterionDto
        {
            CriteriaId = c.CriteriaId,
            AssessmentId = c.AssessmentId,
            CriteriaName = c.CriteriaName ?? string.Empty,
            Weight = c.Weight ?? 0
        }).ToList();

        return new AssessmentWithCriteriaDto
        {
            AssessmentId = assessment.AssessmentId,
            Title = assessment.Title ?? string.Empty,
            Weight = assessment.Weight ?? 0,
            IsFinal = assessment.IsFinal ?? false,
            IsLocked = assessment.IsLocked ?? false,
            Criteria = criteria,
            TotalCriteriaWeight = criteria.Sum(c => c.Weight)
        };
    }
}
