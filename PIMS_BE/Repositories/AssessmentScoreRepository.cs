using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IAssessmentScoreRepository : IGenericRepository<AssessmentScore>
{
    Task<AssessmentScore?> GetByAssessmentAndUserAsync(int assessmentId, int userId);
    Task<List<AssessmentScore>> GetByAssessmentsAndUsersAsync(List<int> assessmentIds, List<int> userIds);
}

public class AssessmentScoreRepository : GenericRepository<AssessmentScore>, IAssessmentScoreRepository
{
    public AssessmentScoreRepository(PimsDbContext context) : base(context) { }

    public async Task<AssessmentScore?> GetByAssessmentAndUserAsync(int assessmentId, int userId)
    {
        return await _context.AssessmentScores
            .FirstOrDefaultAsync(s => s.AssessmentId == assessmentId && s.UserId == userId);
    }

    public async Task<List<AssessmentScore>> GetByAssessmentsAndUsersAsync(List<int> assessmentIds, List<int> userIds)
    {
        return await _context.AssessmentScores
            .Where(s => assessmentIds.Contains(s.AssessmentId) && userIds.Contains(s.UserId))
            .ToListAsync();
    }
}
