using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IMentorRequestRepository : IGenericRepository<MentorRequest>
{
    Task<MentorRequest?> GetRequestWithDetailsAsync(int requestId);
    Task<MentorRequest?> GetPendingRequestByGroupAsync(int groupId);
    Task<List<MentorRequest>> GetPendingRequestsForTeacherAsync(int teacherUserId);
}

public class MentorRequestRepository : GenericRepository<MentorRequest>, IMentorRequestRepository
{
    private const int StatusPending = 1;

    public MentorRequestRepository(PimsDbContext context) : base(context) { }

    public async Task<MentorRequest?> GetRequestWithDetailsAsync(int requestId)
    {
        return await _dbSet
            .Include(r => r.Group).ThenInclude(g => g.Status)
            .Include(r => r.Group).ThenInclude(g => g.Semester)
            .Include(r => r.Group).ThenInclude(g => g.Leader)
            .Include(r => r.Group).ThenInclude(g => g.GroupMembers).ThenInclude(m => m.User)
            .Include(r => r.Group).ThenInclude(g => g.GroupMembers).ThenInclude(m => m.Status)
            .Include(r => r.Group).ThenInclude(g => g.Projects)
            .Include(r => r.User)
            .Include(r => r.Status)
            .FirstOrDefaultAsync(r => r.RequestId == requestId);
    }

    public async Task<MentorRequest?> GetPendingRequestByGroupAsync(int groupId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(r => r.GroupId == groupId && r.StatusId == StatusPending);
    }

    public async Task<List<MentorRequest>> GetPendingRequestsForTeacherAsync(int teacherUserId)
    {
        return await _dbSet
            .Include(r => r.Group).ThenInclude(g => g.Leader)
            .Include(r => r.Group).ThenInclude(g => g.Status)
            .Include(r => r.Status)
            .Where(r => r.UserId == teacherUserId && r.StatusId == StatusPending)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
