using PIMS_BE.DTOs.Assessment;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class AssessmentCriterionService : IAssessmentCriterionService
{
    private readonly IAssessmentCriterionRepository _criterionRepository;
    private readonly IAssessmentRepository _assessmentRepository;

    public AssessmentCriterionService(
        IAssessmentCriterionRepository criterionRepository,
        IAssessmentRepository assessmentRepository)
    {
        _criterionRepository = criterionRepository;
        _assessmentRepository = assessmentRepository;
    }

    public async Task<AssessmentCriterionDto> CreateCriterionAsync(int assessmentId, CreateCriterionDto dto, int userId)
    {
        // Validate assessment exists and is not locked
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        if (assessment.IsLocked == true)
        {
            throw new InvalidOperationException("Cannot add criteria to a locked assessment");
        }

        // Validate total weight
        var currentTotalWeight = await _criterionRepository.GetTotalWeightByAssessmentAsync(assessmentId);
        if (currentTotalWeight + dto.Weight > 100)
        {
            throw new InvalidOperationException(
                $"Total criteria weight exceeds 100%. Current: {currentTotalWeight}%, Attempting to add: {dto.Weight}%");
        }

        var criterion = new AssessmentCriterion
        {
            AssessmentId = assessmentId,
            CriteriaName = dto.CriteriaName,
            Weight = dto.Weight
        };

        await _criterionRepository.AddAsync(criterion);
        await _criterionRepository.SaveChangesAsync();

        return MapToDto(criterion);
    }

    public async Task<List<AssessmentCriterionDto>> CreateMultipleCriteriaAsync(
        int assessmentId, List<CreateCriterionDto> dtos, int userId)
    {
        // Validate assessment exists and is not locked
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        if (assessment.IsLocked == true)
        {
            throw new InvalidOperationException("Cannot add criteria to a locked assessment");
        }

        // Validate total weight
        var totalWeight = dtos.Sum(d => d.Weight);
        if (totalWeight != 100)
        {
            throw new InvalidOperationException(
                $"Total criteria weight must equal 100%. Current total: {totalWeight}%");
        }

        // Delete existing criteria first
        await _criterionRepository.DeleteByAssessmentIdAsync(assessmentId);

        // Create new criteria
        var criteria = dtos.Select(dto => new AssessmentCriterion
        {
            AssessmentId = assessmentId,
            CriteriaName = dto.CriteriaName,
            Weight = dto.Weight
        }).ToList();

        await _criterionRepository.BulkCreateAsync(criteria);

        return criteria.Select(MapToDto).ToList();
    }

    public async Task<AssessmentCriterionDto> UpdateCriterionAsync(int criteriaId, UpdateCriterionDto dto, int userId)
    {
        var criterion = await _criterionRepository.GetByIdAsync(criteriaId);
        if (criterion == null)
        {
            throw new KeyNotFoundException($"Criterion with ID {criteriaId} not found");
        }

        // Check if assessment is locked
        if (criterion.Assessment.IsLocked == true)
        {
            throw new InvalidOperationException("Cannot modify criteria of a locked assessment");
        }

        // Validate weight if being updated
        if (dto.Weight.HasValue)
        {
            var currentTotalWeight = await _criterionRepository
                .GetTotalWeightByAssessmentAsync(criterion.AssessmentId, criteriaId);

            if (currentTotalWeight + dto.Weight.Value > 100)
            {
                throw new InvalidOperationException(
                    $"Total criteria weight would exceed 100%. Current (excluding this): {currentTotalWeight}%, New value: {dto.Weight.Value}%");
            }

            criterion.Weight = dto.Weight.Value;
        }

        if (!string.IsNullOrEmpty(dto.CriteriaName))
        {
            criterion.CriteriaName = dto.CriteriaName;
        }

        _criterionRepository.Update(criterion);
        await _criterionRepository.SaveChangesAsync();

        return MapToDto(criterion);
    }

    public async Task DeleteCriterionAsync(int criteriaId, int userId)
    {
        var criterion = await _criterionRepository.GetByIdAsync(criteriaId);
        if (criterion == null)
        {
            throw new KeyNotFoundException($"Criterion with ID {criteriaId} not found");
        }

        // Check if assessment is locked
        if (criterion.Assessment.IsLocked == true)
        {
            throw new InvalidOperationException("Cannot delete criteria from a locked assessment");
        }

        // Check if has grades
        var hasGrades = await _criterionRepository.HasGradesAsync(criteriaId);
        if (hasGrades)
        {
            throw new InvalidOperationException("Cannot delete criterion with existing grades");
        }

        // Check if this is the last criterion
        var count = await _criterionRepository.GetCountByAssessmentIdAsync(criterion.AssessmentId);
        if (count <= 1)
        {
            throw new InvalidOperationException("Cannot delete the last criterion. Assessment must have at least one criterion");
        }

        _criterionRepository.Remove(criterion);
        await _criterionRepository.SaveChangesAsync();
    }

    public async Task<AssessmentCriterionDto?> GetCriterionByIdAsync(int criteriaId)
    {
        var criterion = await _criterionRepository.GetByIdAsync(criteriaId);
        if (criterion == null)
        {
            return null;
        }

        return MapToDto(criterion);
    }

    public async Task<List<AssessmentCriterionDto>> GetCriteriaByAssessmentIdAsync(int assessmentId)
    {
        var criteria = await _criterionRepository.GetCriteriaByAssessmentIdAsync(assessmentId);
        return criteria.Select(MapToDto).ToList();
    }

    public async Task<bool> ValidateCriteriaWeightsAsync(int assessmentId, int? excludeCriteriaId = null)
    {
        var totalWeight = await _criterionRepository
            .GetTotalWeightByAssessmentAsync(assessmentId, excludeCriteriaId);
        return totalWeight == 100m;
    }

    private AssessmentCriterionDto MapToDto(AssessmentCriterion criterion)
    {
        return new AssessmentCriterionDto
        {
            CriteriaId = criterion.CriteriaId,
            AssessmentId = criterion.AssessmentId,
            CriteriaName = criterion.CriteriaName ?? string.Empty,
            Weight = criterion.Weight ?? 0
        };
    }
}
