using PIMS_BE.Models;

namespace PIMS_BE.Repositories
{
    public interface IMemberRepository : IGenericRepository<GroupMember>
    {
        Task<GroupMember?> GetActiveMemberByUserIdAsync(int userId);
        Task<bool> HasActiveMemberInSemesterAsync(int userId, int semesterId);
        Task<GroupMember?> GetActiveMemberWithGroupInSemesterAsync(int userId, int semesterId);
    }
}
