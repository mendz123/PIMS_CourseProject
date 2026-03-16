using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IGroupRepository : IGenericRepository<Group>
{
    Task<Group?> GetGroupWithDetailsAsync(int groupId);
    Task<(List<Group> Items, int TotalCount)> GetGroupsInActiveSemesterAsync(int semesterId, string? search, int? mentorId, int pageNumber, int pageSize);
    Task<List<Group>> GetSubmittedGroupsByMentorAsync(int semesterId, int mentorUserId);
    
    Task<(List<Group> Items, int TotalCount)> GetGroupsInActiveSemesterAsync(int semesterId, string? search, int pageNumber, int pageSize);
    Task<List<Group>> GetGroupsByTeacherAsync(int teacherId, int semesterId);
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
                .ThenInclude(u => u.StudentFinalResults)
            .Include(g => g.GroupMembers).ThenInclude(m => m.Status)
            .Include(g => g.Projects).ThenInclude(p => p.Status)
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

  
    public async Task<(List<Group> Items, int TotalCount)> GetGroupsInActiveSemesterAsync(int semesterId, string? search, int pageNumber, int pageSize)
    {
        var query = _dbSet
            .Include(g => g.Status)
            .Include(g => g.Semester)
            .Include(g => g.Leader)
            .Include(g => g.GroupMembers)
            .Where(g => g.SemesterId == semesterId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(g => g.GroupName != null && g.GroupName.Contains(search));

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(g => g.GroupId)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<List<Group>> GetGroupsByTeacherAsync(int teacherId, int semesterId)
    {
        // Find groups where the given teacher is the mentor, in the specified semester
        return await _dbSet
            .Include(g => g.GroupMembers)
                .ThenInclude(gm => gm.User)
                    .ThenInclude(u => u.AssessmentScores)
            .Include(g => g.GroupMembers)
                .ThenInclude(gm => gm.User)
                    .ThenInclude(u => u.CriteriaGradeUsers)
    .ThenInclude(cg => cg.Criteria)

            .Include(g => g.GroupMembers)
                .ThenInclude(gm => gm.User)
                    .ThenInclude(u => u.StudentFinalResults)
            .Include(g => g.ProjectSubmissions)
                .ThenInclude(ps => ps.Submitter)
            .Where(g => g.MentorId == teacherId && g.SemesterId == semesterId && g.StatusId == 4)
            .OrderBy(g => g.GroupId)
            .ToListAsync();
    }
}
