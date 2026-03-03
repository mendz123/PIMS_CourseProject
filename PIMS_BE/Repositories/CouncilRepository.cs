using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface ICouncilRepository : IGenericRepository<Council>
{
    Task<IEnumerable<Council>> GetAllWithMembersAsync();
    Task<Council?> GetWithMembersAsync(int councilId);
    Task<IEnumerable<Council>> GetBySemesterAsync(int semesterId);
    void RemoveMembers(IEnumerable<CouncilMember> members);
}

public class CouncilRepository : GenericRepository<Council>, ICouncilRepository
{
    public CouncilRepository(PimsDbContext context) : base(context) { }

    public async Task<IEnumerable<Council>> GetAllWithMembersAsync()
        => await _context.Councils
            .Include(c => c.CouncilMembers)
                .ThenInclude(m => m.User)
            .ToListAsync();

    public void RemoveMembers(IEnumerable<CouncilMember> members)
        => _context.Set<CouncilMember>().RemoveRange(members);

    public async Task<Council?> GetWithMembersAsync(int councilId)
        => await _context.Councils
            .Include(c => c.CouncilMembers)
                .ThenInclude(m => m.User)
            .Include(c => c.DefenseSchedules)
            .FirstOrDefaultAsync(c => c.CouncilId == councilId);

    public async Task<IEnumerable<Council>> GetBySemesterAsync(int semesterId)
        => await _context.Councils
            .Include(c => c.CouncilMembers)
                .ThenInclude(m => m.User)
            .Where(c => c.SemesterId == semesterId)
            .ToListAsync();
}
