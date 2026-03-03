using PIMS_BE.DTOs.Group;
using PIMS_BE.DTOs.Project;

namespace PIMS_BE.Services.Interfaces
{
    public interface IGroupService
    {
        Task<GroupDto> CreateGroupAsync(int userId, string groupName);
        Task<GroupDto?> GetMyGroupAsync(int userId);
        Task<GroupDetailDto?> GetMyGroupDetailAsync(int userId);
        Task<(List<GroupDto> Items, int TotalCount)> GetGroupsAsync(string? search, int pageNumber, int pageSize, int? filterByMentorId, bool includeMentorInfo);
        Task<GroupDetailDto?> GetGroupDetailAsync(int groupId);
        Task<InvitationDto> InviteMemberAsync(int leaderId, int groupId, string invitedEmail);
        Task<GroupDto> RespondToInvitationAsync(int userId, int invitationId, bool accept);
        Task<List<InvitationDto>> GetPendingInvitationsAsync(int userId);
        Task<InvitationDetailDto?> GetInvitationDetailAsync(int userId, int invitationId);

        // Mentor request
        Task<MentorRequestDto> SendMentorInvitationAsync(int leaderId, int groupId, string mentorEmail, string? message);
        Task<List<MentorRequestDto>> GetPendingMentorRequestsAsync(int teacherUserId);
        Task<MentorRequestDetailDto?> GetMentorRequestDetailAsync(int teacherUserId, int requestId);
        Task<GroupDto> RespondToMentorRequestAsync(int teacherUserId, int requestId, bool accept);

        // Topic registration
        Task<ProjectDto> RegisterTopicAsync(int leaderId, int groupId, RegisterTopicRequestDto dto);
        Task<ProjectDto> UpdateTopicAsync(int leaderId, int groupId, RegisterTopicRequestDto dto);
        Task<List<TopicReviewDto>> GetPendingTopicRequestsAsync(int teacherUserId);
        Task<GroupDto> ReviewTopicAsync(int teacherUserId, int groupId, bool approve);

        // Leave group
        Task LeaveGroupAsync(int userId);
    }
}

