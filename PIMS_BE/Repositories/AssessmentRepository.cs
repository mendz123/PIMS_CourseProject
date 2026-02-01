using PIMS_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Repositories;

public interface IAssessmentRepository : IGenericRepository<Assessment>
{
    Task<List<Assessment>> GetAssessmentsBySemesterAsync(int semesterId);
    Task<Assessment?> GetAssessmentWithCriteriaAsync(int assessmentId);
    Task<List<Assessment>> GetAssessmentsWithCriteriaAsync(int semesterId);
    Task<bool> HasScoresAsync(int assessmentId);
    Task<decimal> GetTotalWeightBySemesterAsync(int semesterId, int? excludeAssessmentId = null);
}

public class AssessmentRepository : GenericRepository<Assessment>, IAssessmentRepository
{
    public AssessmentRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<List<Assessment>> GetAssessmentsBySemesterAsync(int semesterId)
    {
        return await _context.Assessments
            .Include(a => a.CreatedByNavigation)
            .Where(a => a.SemesterId == semesterId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<Assessment?> GetAssessmentWithCriteriaAsync(int assessmentId)
    {
        return await _context.Assessments
            .Include(a => a.AssessmentCriteria)
            .Include(a => a.CreatedByNavigation)
            .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId);
    }

    public async Task<List<Assessment>> GetAssessmentsWithCriteriaAsync(int semesterId)
    {
        return await _context.Assessments
            .Include(a => a.AssessmentCriteria)
            .Include(a => a.CreatedByNavigation)
            .Where(a => a.SemesterId == semesterId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> HasScoresAsync(int assessmentId)
    {
        return await _context.AssessmentScores
            .AnyAsync(s => s.AssessmentId == assessmentId);
    }

    public async Task<decimal> GetTotalWeightBySemesterAsync(int semesterId, int? excludeAssessmentId = null)
    {
        var query = _context.Assessments
            .Where(a => a.SemesterId == semesterId);

        if (excludeAssessmentId.HasValue)
        {
            query = query.Where(a => a.AssessmentId != excludeAssessmentId.Value);
        }

        return await query.SumAsync(a => a.Weight ?? 0);
    }
}
