using PIMS_BE.DTOs.Group;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services
{
    public class GroupService : IGroupService
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly ISemesterRepository _semesterRepository;
        private readonly IGroupInvitationRepository _invitationRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;

        private const int StatusCreated = 1;
        private const int StatusForming = 2;
        private const int MemberStatusActive = 1;
        private const int UserStatusActive = 1;
        private const int MinMembersForForming = 4;
        private const int MaxGroupMembers = 5;

        public GroupService(
            IGroupRepository groupRepository,
            IMemberRepository memberRepository,
            ISemesterRepository semesterRepository,
            IGroupInvitationRepository invitationRepository,
            IUserRepository userRepository,
            INotificationService notificationService)
        {
            _groupRepository = groupRepository;
            _memberRepository = memberRepository;
            _semesterRepository = semesterRepository;
            _invitationRepository = invitationRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
        }

        public async Task<GroupDto> CreateGroupAsync(int userId, string groupName)
        {
            if (string.IsNullOrWhiteSpace(groupName))
                throw new InvalidOperationException("Group name cannot be empty.");

            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("No active semester found.");

            var alreadyInGroup = await _memberRepository.HasActiveMemberInSemesterAsync(userId, activeSemester.SemesterId);
            if (alreadyInGroup)
                throw new InvalidOperationException("You are already a member of a group in the current semester.");

            var group = new Group
            {
                GroupName = groupName.Trim(),
                SemesterId = activeSemester.SemesterId,
                LeaderId = userId,
                StatusId = 1 // CREATED
            };

            await _groupRepository.AddAsync(group);
            await _groupRepository.SaveChangesAsync();

            var member = new GroupMember
            {
                GroupId = group.GroupId,
                UserId = userId,
                StatusId = 1 // ACTIVE
            };

            await _memberRepository.AddAsync(member);
            await _memberRepository.SaveChangesAsync();

            return new GroupDto
            {
                GroupId = group.GroupId,
                GroupName = group.GroupName,
                SemesterId = activeSemester.SemesterId,
                SemesterName = activeSemester.SemesterName ?? "",
                LeaderId = userId,
                LeaderName = "",
                StatusId = 1,
                StatusName = "CREATED",
                IsLeader = true,
                MemberCount = 1
            };
        }

        public async Task<GroupDto?> GetMyGroupAsync(int userId)
        {
            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault();
            if (activeSemester == null) return null;

            var memberInfo = await _memberRepository.GetActiveMemberWithGroupInSemesterAsync(userId, activeSemester.SemesterId);
            if (memberInfo == null) return null;

            var group = memberInfo.Group;
            return new GroupDto
            {
                GroupId = group.GroupId,
                GroupName = group.GroupName ?? "",
                SemesterId = group.SemesterId,
                SemesterName = group.Semester?.SemesterName ?? "",
                LeaderId = group.LeaderId,
                LeaderName = group.Leader?.FullName ?? "",
                StatusId = group.StatusId,
                StatusName = group.Status?.StatusName ?? "",
                IsLeader = group.LeaderId == userId,
                MemberCount = group.GroupMembers.Count(m => m.StatusId == 1)
            };
        }

        public async Task<(List<GroupDto> Items, int TotalCount)> GetGroupsAsync(string? search, int pageNumber, int pageSize, int? filterByMentorId, bool includeMentorInfo)
        {
            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("No active semester found.");

            var (groups, totalCount) = await _groupRepository.GetGroupsInActiveSemesterAsync(
                activeSemester.SemesterId, search, filterByMentorId, pageNumber, pageSize);

            var items = groups.Select(g => new GroupDto
            {
                GroupId = g.GroupId,
                GroupName = g.GroupName ?? "",
                SemesterId = g.SemesterId,
                SemesterName = g.Semester?.SemesterName ?? "",
                LeaderId = g.LeaderId,
                LeaderName = g.Leader?.FullName ?? "",
                MentorId = includeMentorInfo ? g.MentorId : null,
                MentorName = includeMentorInfo ? (g.Mentor?.FullName ?? "") : null,
                StatusId = g.StatusId,
                StatusName = g.Status?.StatusName ?? "",
                IsLeader = false,
                MemberCount = g.GroupMembers.Count(m => m.StatusId == 1)
            }).ToList();

            return (items, totalCount);
        }

        public async Task<GroupDetailDto?> GetGroupDetailAsync(int groupId)
        {
            var group = await _groupRepository.GetGroupWithDetailsAsync(groupId);
            if (group == null) return null;

            return new GroupDetailDto
            {
                GroupId = group.GroupId,
                GroupName = group.GroupName ?? "",
                SemesterId = group.SemesterId,
                SemesterName = group.Semester?.SemesterName ?? "",
                LeaderId = group.LeaderId,
                LeaderName = group.Leader?.FullName ?? "",
                MentorId = group.MentorId,
                MentorName = group.Mentor?.FullName,
                StatusId = group.StatusId,
                StatusName = group.Status?.StatusName ?? "",
                IsLeader = false,
                MemberCount = group.GroupMembers.Count(m => m.StatusId == 1),
                Members = group.GroupMembers.Select(m => new GroupMemberDto
                {
                    GroupMemberId = m.GroupMemberId,
                    UserId = m.UserId,
                    FullName = m.User?.FullName ?? "",
                    Email = m.User?.Email ?? "",
                    AvatarUrl = m.User?.AvatarUrl,
                    StatusId = m.StatusId,
                    StatusName = m.Status?.StatusName ?? ""
                }).ToList()
            };
        }

        public async Task<InvitationDto> InviteMemberAsync(int leaderId, int groupId, int invitedUserId)
        {
            var group = await _groupRepository.GetGroupWithDetailsAsync(groupId)
                ?? throw new InvalidOperationException("Group not found.");

            if (group.LeaderId != leaderId)
                throw new InvalidOperationException("Only the group leader can invite members.");

            var invitedUser = await _userRepository.GetByIdWithDetailsAsync(invitedUserId)
                ?? throw new InvalidOperationException($"User with ID {invitedUserId} not found.");

            if (invitedUser.StatusId != UserStatusActive)
                throw new InvalidOperationException("This user account is inactive.");

            if (invitedUser.Role?.RoleName != "STUDENT")
                throw new InvalidOperationException("Only students can be invited to join a group.");

            if (invitedUserId == leaderId)
                throw new InvalidOperationException("You cannot invite yourself.");

            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("No active semester found.");

            var alreadyInGroup = await _memberRepository.HasActiveMemberInSemesterAsync(invitedUserId, activeSemester.SemesterId);
            if (alreadyInGroup)
                throw new InvalidOperationException("This user is already a member of a group in the current semester.");

            var currentMemberCount = group.GroupMembers.Count(m => m.StatusId == MemberStatusActive);
            if (currentMemberCount >= MaxGroupMembers)
                throw new InvalidOperationException($"The group already has {MaxGroupMembers} members.");

            var existingInvitation = await _invitationRepository.GetPendingInvitationByGroupAndUserAsync(groupId, invitedUserId);
            if (existingInvitation != null)
                throw new InvalidOperationException("This user already has a pending invitation from your group.");

            var invitation = new GroupInvitation
            {
                GroupId = groupId,
                InvitedUserId = invitedUserId,
                InvitedByUserId = leaderId,
                Status = InvitationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _invitationRepository.AddAsync(invitation);
            await _invitationRepository.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(invitedUserId, new DTOs.Notification.CreateNotificationRequest
            {
                Title = "Group Invitation",
                Content = $"You have been invited to join group '{group.GroupName}'. Invitation ID: #{invitation.InvitationId}."
            });

            var leader = group.Leader;
            return new InvitationDto
            {
                InvitationId = invitation.InvitationId,
                GroupId = groupId,
                GroupName = group.GroupName ?? "",
                InvitedUserId = invitedUserId,
                InvitedUserName = invitedUser.FullName ?? "",
                InvitedByUserId = leaderId,
                InvitedByUserName = leader?.FullName ?? "",
                Status = InvitationStatus.Pending.ToString(),
                CreatedAt = invitation.CreatedAt
            };
        }

        public async Task<GroupDto> RespondToInvitationAsync(int userId, int invitationId, bool accept)
        {
            var invitation = await _invitationRepository.GetInvitationWithDetailsAsync(invitationId)
                ?? throw new InvalidOperationException("Invitation not found.");

            if (invitation.InvitedUserId != userId)
                throw new InvalidOperationException("You are not authorized to respond to this invitation.");

            if (invitation.Status != InvitationStatus.Pending)
                throw new InvalidOperationException("This invitation has already been processed.");

            if (!accept)
            {
                invitation.Status = InvitationStatus.Rejected;
                await _invitationRepository.UpdateAsync(invitation);
                await _invitationRepository.SaveChangesAsync();

                var rejectedGroup = await _groupRepository.GetGroupWithDetailsAsync(invitation.GroupId)!;
                return MapGroupToDto(rejectedGroup!, userId);
            }

            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("No active semester found.");

            var alreadyInGroup = await _memberRepository.HasActiveMemberInSemesterAsync(userId, activeSemester.SemesterId);
            if (alreadyInGroup)
                throw new InvalidOperationException("You are already a member of a group in the current semester.");

            var group = invitation.Group;
            var currentMemberCount = group.GroupMembers.Count(m => m.StatusId == MemberStatusActive);
            if (currentMemberCount >= MaxGroupMembers)
                throw new InvalidOperationException($"The group already has {MaxGroupMembers} members.");

            var newMember = new GroupMember
            {
                GroupId = invitation.GroupId,
                UserId = userId,
                StatusId = MemberStatusActive
            };

            await _memberRepository.AddAsync(newMember);

            invitation.Status = InvitationStatus.Accepted;
            await _invitationRepository.UpdateAsync(invitation);

            var newMemberCount = currentMemberCount + 1;
            if (group.StatusId == StatusCreated && newMemberCount >= MinMembersForForming)
            {
                group.StatusId = StatusForming;
                await _groupRepository.UpdateAsync(group);
            }

            await _memberRepository.SaveChangesAsync();

            var updatedGroup = await _groupRepository.GetGroupWithDetailsAsync(invitation.GroupId)!;
            return MapGroupToDto(updatedGroup!, userId);
        }

        public async Task<List<InvitationDto>> GetPendingInvitationsAsync(int userId)
        {
            var invitations = await _invitationRepository.GetPendingInvitationsForUserAsync(userId);
            return invitations.Select(i => new InvitationDto
            {
                InvitationId = i.InvitationId,
                GroupId = i.GroupId,
                GroupName = i.Group?.GroupName ?? "",
                InvitedUserId = i.InvitedUserId,
                InvitedUserName = "",
                InvitedByUserId = i.InvitedByUserId,
                InvitedByUserName = i.InvitedByUser?.FullName ?? "",
                Status = i.Status.ToString(),
                CreatedAt = i.CreatedAt
            }).ToList();
        }

        public async Task<InvitationDetailDto?> GetInvitationDetailAsync(int userId, int invitationId)
        {
            var invitation = await _invitationRepository.GetInvitationWithDetailsAsync(invitationId);
            if (invitation == null || invitation.InvitedUserId != userId)
                return null;

            var group = await _groupRepository.GetGroupWithDetailsAsync(invitation.GroupId);
            if (group == null) return null;

            return new InvitationDetailDto
            {
                InvitationId = invitation.InvitationId,
                GroupId = group.GroupId,
                GroupName = group.GroupName ?? "",
                LeaderId = group.LeaderId,
                LeaderName = group.Leader?.FullName ?? "",
                MemberCount = group.GroupMembers.Count(m => m.StatusId == MemberStatusActive),
                Members = group.GroupMembers
                    .Where(m => m.StatusId == MemberStatusActive)
                    .Select(m => new GroupMemberDto
                    {
                        GroupMemberId = m.GroupMemberId,
                        UserId = m.UserId,
                        FullName = m.User?.FullName ?? "",
                        Email = m.User?.Email ?? "",
                        AvatarUrl = m.User?.AvatarUrl,
                        StatusId = m.StatusId,
                        StatusName = m.Status?.StatusName ?? ""
                    }).ToList(),
                InvitedByUserName = invitation.InvitedByUser?.FullName ?? "",
                Status = invitation.Status.ToString()
            };
        }

        private static GroupDto MapGroupToDto(Group group, int currentUserId)
        {
            return new GroupDto
            {
                GroupId = group.GroupId,
                GroupName = group.GroupName ?? "",
                SemesterId = group.SemesterId,
                SemesterName = group.Semester?.SemesterName ?? "",
                LeaderId = group.LeaderId,
                LeaderName = group.Leader?.FullName ?? "",
                MentorId = group.MentorId,
                MentorName = group.Mentor?.FullName,
                StatusId = group.StatusId,
                StatusName = group.Status?.StatusName ?? "",
                IsLeader = group.LeaderId == currentUserId,
                MemberCount = group.GroupMembers.Count(m => m.StatusId == 1)
            };
        }
    }
}
