using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface ICouncilCriteriaGradeRepository : IGenericRepository<CouncilCriteriaGrade>
{
    Task<List<int>> GetTeachersWhoGradedAsync(int councilId, int groupId, List<int>? criteriaIds = null);
    Task<List<CouncilCriteriaGrade>> GetGradesForGroupAsync(int councilId, int groupId);
    Task<CouncilCriteriaGrade?> GetGradeAsync(int councilId, int groupId, int userId, int teacherId, int criteriaId);
}

public class CouncilCriteriaGradeRepository : GenericRepository<CouncilCriteriaGrade>, ICouncilCriteriaGradeRepository
{
    public CouncilCriteriaGradeRepository(PimsDbContext context) : base(context) { }

    public async Task<List<int>> GetTeachersWhoGradedAsync(int councilId, int groupId, List<int>? criteriaIds = null)
    {
        var query = _context.CouncilCriteriaGrades
            .Where(g => g.CouncilId == councilId && g.GroupId == groupId);

        if (criteriaIds != null && criteriaIds.Any())
        {
            query = query.Where(g => criteriaIds.Contains(g.CriteriaId));
        }

        return await query
            .Select(g => g.TeacherId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<CouncilCriteriaGrade>> GetGradesForGroupAsync(int councilId, int groupId)
    {
        return await _context.CouncilCriteriaGrades
            .Where(g => g.CouncilId == councilId && g.GroupId == groupId)
            .ToListAsync();
    }

    public async Task<CouncilCriteriaGrade?> GetGradeAsync(int councilId, int groupId, int userId, int teacherId, int criteriaId)
    {
        return await _context.CouncilCriteriaGrades
            .FirstOrDefaultAsync(g => g.CouncilId == councilId 
                                   && g.GroupId == groupId 
                                   && g.UserId == userId 
                                   && g.TeacherId == teacherId 
                                   && g.CriteriaId == criteriaId);
    }
}
