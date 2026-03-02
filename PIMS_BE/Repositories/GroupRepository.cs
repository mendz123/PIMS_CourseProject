using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IGroupRepository : IGenericRepository<Group>
{
    Task<Group?> GetGroupWithDetailsAsync(int groupId);
    Task<(List<Group> Items, int TotalCount)> GetGroupsInActiveSemesterAsync(int semesterId, string? search, int? mentorId, int pageNumber, int pageSize);
    Task<List<Group>> GetSubmittedGroupsByMentorAsync(int semesterId, int mentorUserId);
}

public class GroupRepository : GenericRepository<Group>, IGroupRepository
{
    public GroupRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<Group?> GetGroupWithDetailsAsync(int groupId)
    {
        return await _dbSet
            .Include(g => g.Status)
            .Include(g => g.Semester)
            .Include(g => g.Leader)
            .Include(g => g.Mentor)
            .Include(g => g.GroupMembers).ThenInclude(m => m.User)
            .Include(g => g.GroupMembers).ThenInclude(m => m.Status)
            .Include(g => g.Projects)
            .FirstOrDefaultAsync(g => g.GroupId == groupId);
    }

    public async Task<(List<Group> Items, int TotalCount)> GetGroupsInActiveSemesterAsync(int semesterId, string? search, int? mentorId, int pageNumber, int pageSize)
    {
        var query = _dbSet
            .Include(g => g.Status)
            .Include(g => g.Semester)
            .Include(g => g.Leader)
            .Include(g => g.Mentor)
            .Include(g => g.GroupMembers)
            .Where(g => g.SemesterId == semesterId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(g => g.GroupName != null && g.GroupName.Contains(search));

        if (mentorId.HasValue)
            query = query.Where(g => g.MentorId == mentorId.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(g => g.GroupId)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<List<Group>> GetSubmittedGroupsByMentorAsync(int semesterId, int mentorUserId)
    {
        return await _dbSet
            .Include(g => g.Status)
            .Include(g => g.Semester)
            .Include(g => g.Leader)
            .Include(g => g.Projects)
            .Where(g => g.SemesterId == semesterId && g.MentorId == mentorUserId && g.StatusId == 3)
            .ToListAsync();
    }
}
