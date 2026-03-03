using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IGroupInvitationRepository : IGenericRepository<GroupInvitation>
{
    Task<GroupInvitation?> GetInvitationWithDetailsAsync(int invitationId);
    Task<GroupInvitation?> GetPendingInvitationByGroupAndUserAsync(int groupId, int invitedUserId);
    Task<List<GroupInvitation>> GetPendingInvitationsForUserAsync(int userId);
}

public class GroupInvitationRepository : GenericRepository<GroupInvitation>, IGroupInvitationRepository
{
    public GroupInvitationRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<GroupInvitation?> GetInvitationWithDetailsAsync(int invitationId)
    {
        return await _dbSet
            .Include(i => i.Group).ThenInclude(g => g.Status)
            .Include(i => i.Group).ThenInclude(g => g.GroupMembers)
            .Include(i => i.InvitedUser).ThenInclude(u => u.Status)
            .Include(i => i.InvitedByUser)
            .FirstOrDefaultAsync(i => i.InvitationId == invitationId);
    }

    public async Task<GroupInvitation?> GetPendingInvitationByGroupAndUserAsync(int groupId, int invitedUserId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(i => i.GroupId == groupId
                && i.InvitedUserId == invitedUserId
                && i.Status == InvitationStatus.Pending);
    }

    public async Task<List<GroupInvitation>> GetPendingInvitationsForUserAsync(int userId)
    {
        return await _dbSet
            .Include(i => i.Group)
            .Include(i => i.InvitedByUser)
            .Where(i => i.InvitedUserId == userId && i.Status == InvitationStatus.Pending)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }
}
