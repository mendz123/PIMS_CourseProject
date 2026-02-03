using PIMS_BE.Models;

namespace PIMS_BE.Repositories
{
    public interface IMemberRepository : IGenericRepository<GroupMember>
    {
        Task<GroupMember?> GetActiveMemberByUserIdAsync(int userId);
    }
}
