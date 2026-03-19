using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface ICouncilRepository : IGenericRepository<Council>
{
    Task<Council?> GetWithMembersAsync(int councilId);
    Task<IEnumerable<Council>> GetAllWithMembersAsync();
    Task<IEnumerable<Council>> GetBySemesterAsync(int semesterId);
    Task<List<int>> GetMemberUserIdsAsync(int councilId);
}

public class CouncilRepository : GenericRepository<Council>, ICouncilRepository
{
    public CouncilRepository(PimsDbContext context) : base(context) { }

    public async Task<Council?> GetWithMembersAsync(int councilId)
        => await _context.Councils
            .Include(c => c.Semester)
            .Include(c => c.CouncilMembers)
                .ThenInclude(m => m.User)
            .Include(c => c.DefenseSchedules)
            .FirstOrDefaultAsync(c => c.CouncilId == councilId);

    public async Task<IEnumerable<Council>> GetAllWithMembersAsync()
        => await _context.Councils
            .Include(c => c.Semester)
            .Include(c => c.CouncilMembers)
                .ThenInclude(m => m.User)
            .ToListAsync();

    public async Task<IEnumerable<Council>> GetBySemesterAsync(int semesterId)
        => await _context.Councils
            .Include(c => c.Semester)
            .Include(c => c.CouncilMembers)
                .ThenInclude(m => m.User)
            .Where(c => c.SemesterId == semesterId)
            .ToListAsync();

    public async Task<List<int>> GetMemberUserIdsAsync(int councilId)
    {
        return await _context.CouncilMembers
            .Where(m => m.CouncilId == councilId)
            .Select(m => m.UserId)
            .ToListAsync();
    }
}
