using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories
{
    public class MemberRepository : GenericRepository<GroupMember>, IMemberRepository
    {
        public MemberRepository(PimsDbContext context) : base(context)
        {
        }

        public async Task<GroupMember?> GetActiveMemberByUserIdAsync(int userId)
        {
            return await _dbSet.FirstOrDefaultAsync(m => m.UserId == userId && m.StatusId == 1);
        }

        public async Task<bool> HasActiveMemberInSemesterAsync(int userId, int semesterId)
        {
            return await _dbSet
                .Include(m => m.Group)
                .AnyAsync(m => m.UserId == userId && m.StatusId == 1 && m.Group.SemesterId == semesterId);
        }

        public async Task<GroupMember?> GetActiveMemberWithGroupInSemesterAsync(int userId, int semesterId)
        {
            return await _dbSet
                .Include(m => m.Group).ThenInclude(g => g.Status)
                .Include(m => m.Group).ThenInclude(g => g.Leader)
                .Include(m => m.Group).ThenInclude(g => g.Semester)
                .Include(m => m.Group).ThenInclude(g => g.Mentor)
                .Include(m => m.Group).ThenInclude(g => g.GroupMembers)
                .FirstOrDefaultAsync(m => m.UserId == userId && m.StatusId == 1 && m.Group.SemesterId == semesterId);
        }
    }
}
