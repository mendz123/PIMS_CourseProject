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
    }
}
