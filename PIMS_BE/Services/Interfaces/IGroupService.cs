using PIMS_BE.DTOs.Group;

namespace PIMS_BE.Services.Interfaces
{
    public interface IGroupService
    {
        Task<GroupDto> CreateGroupAsync(int userId, string groupName);
        Task<GroupDto?> GetMyGroupAsync(int userId);
    }
}
