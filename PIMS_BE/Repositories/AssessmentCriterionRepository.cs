using PIMS_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Repositories;

public interface IAssessmentCriterionRepository : IGenericRepository<AssessmentCriterion>
{
    Task<List<AssessmentCriterion>> GetCriteriaByAssessmentIdAsync(int assessmentId);
    Task<AssessmentCriterion?> GetByIdAsync(int criteriaId);
    Task<decimal> GetTotalWeightByAssessmentAsync(int assessmentId, int? excludeCriteriaId = null);
    Task<bool> HasGradesAsync(int criteriaId);
    Task<int> GetCountByAssessmentIdAsync(int assessmentId);
    Task BulkCreateAsync(List<AssessmentCriterion> criteria);
    Task DeleteByAssessmentIdAsync(int assessmentId);
}

public class AssessmentCriterionRepository : GenericRepository<AssessmentCriterion>, IAssessmentCriterionRepository
{
    public AssessmentCriterionRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<List<AssessmentCriterion>> GetCriteriaByAssessmentIdAsync(int assessmentId)
    {
        return await _context.AssessmentCriteria
            .Where(c => c.AssessmentId == assessmentId)
            .OrderBy(c => c.CriteriaId)
            .ToListAsync();
    }

    public async Task<AssessmentCriterion?> GetByIdAsync(int criteriaId)
    {
        return await _context.AssessmentCriteria
            .Include(c => c.Assessment)
            .FirstOrDefaultAsync(c => c.CriteriaId == criteriaId);
    }

    public async Task<decimal> GetTotalWeightByAssessmentAsync(int assessmentId, int? excludeCriteriaId = null)
    {
        var query = _context.AssessmentCriteria
            .Where(c => c.AssessmentId == assessmentId);

        if (excludeCriteriaId.HasValue)
        {
            query = query.Where(c => c.CriteriaId != excludeCriteriaId.Value);
        }

        return await query.SumAsync(c => c.Weight ?? 0);
    }

    public async Task<bool> HasGradesAsync(int criteriaId)
    {
        return await _context.CriteriaGrades
            .AnyAsync(g => g.CriteriaId == criteriaId) ||
               await _context.CouncilCriteriaGrades
            .AnyAsync(g => g.CriteriaId == criteriaId);
    }

    public async Task<int> GetCountByAssessmentIdAsync(int assessmentId)
    {
        return await _context.AssessmentCriteria
            .CountAsync(c => c.AssessmentId == assessmentId);
    }

    public async Task BulkCreateAsync(List<AssessmentCriterion> criteria)
    {
        await _context.AssessmentCriteria.AddRangeAsync(criteria);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteByAssessmentIdAsync(int assessmentId)
    {
        var criteria = await _context.AssessmentCriteria
            .Where(c => c.AssessmentId == assessmentId)
            .ToListAsync();

        _context.AssessmentCriteria.RemoveRange(criteria);
        await _context.SaveChangesAsync();
    }
}
