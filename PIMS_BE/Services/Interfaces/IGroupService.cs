using PIMS_BE.DTOs.Group;

namespace PIMS_BE.Services.Interfaces
{
    public interface IGroupService
    {
        Task<GroupDto> CreateGroupAsync(int userId, string groupName);
        Task<GroupDto?> GetMyGroupAsync(int userId);
        Task<(List<GroupDto> Items, int TotalCount)> GetGroupsAsync(string? search, int pageNumber, int pageSize, int? filterByMentorId, bool includeMentorInfo);
        Task<GroupDetailDto?> GetGroupDetailAsync(int groupId);
        Task<InvitationDto> InviteMemberAsync(int leaderId, int groupId, int invitedUserId);
        Task<GroupDto> RespondToInvitationAsync(int userId, int invitationId, bool accept);
        Task<List<InvitationDto>> GetPendingInvitationsAsync(int userId);
        Task<InvitationDetailDto?> GetInvitationDetailAsync(int userId, int invitationId);
    }
}
