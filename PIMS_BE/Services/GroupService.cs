using PIMS_BE.DTOs.Group;
using PIMS_BE.DTOs.Project;
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
        private readonly IMentorRequestRepository _mentorRequestRepository;
        private readonly IProjectRepository _projectRepository;

        private const int StatusCreated = 1;
        private const int StatusForming = 2;
        private const int StatusSubmitted = 3;
        private const int StatusApproved = 4;
        private const int MemberStatusActive = 1;
        private const int MemberStatusLeft = 2;
        private const int UserStatusActive = 1;
        private const int MinMembersForForming = 4;
        private const int MaxGroupMembers = 5;
        private const int MentorRequestStatusPending = 1;
        private const int MentorRequestStatusAccepted = 2;
        private const int MentorRequestStatusRejected = 3;
        private const int ProjectStatusPending = 1;
        private const int ProjectStatusApproved = 2;
        private const int ProjectStatusRejected = 3;

        public GroupService(
            IGroupRepository groupRepository,
            IMemberRepository memberRepository,
            ISemesterRepository semesterRepository,
            IGroupInvitationRepository invitationRepository,
            IUserRepository userRepository,
            INotificationService notificationService,
            IMentorRequestRepository mentorRequestRepository,
            IProjectRepository projectRepository)
        {
            _groupRepository = groupRepository;
            _memberRepository = memberRepository;
            _semesterRepository = semesterRepository;
            _invitationRepository = invitationRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _mentorRequestRepository = mentorRequestRepository;
            _projectRepository = projectRepository;
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
            var memberCount = group.GroupMembers.Count(m => m.StatusId == MemberStatusActive);

            // Auto-transition to FORMING if the group has reached the minimum member count
            if (group.StatusId == StatusCreated && memberCount >= MinMembersForForming)
            {
                group.StatusId = StatusForming;
                await _groupRepository.UpdateAsync(group);
                await _groupRepository.SaveChangesAsync();
                var refreshed = await _groupRepository.GetGroupWithDetailsAsync(group.GroupId);
                if (refreshed != null)
                {
                    group = refreshed;
                    memberCount = group.GroupMembers.Count(m => m.StatusId == MemberStatusActive);
                }
            }

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
                IsLeader = group.LeaderId == userId,
                MemberCount = memberCount
            };
        }

        public async Task<GroupDetailDto?> GetMyGroupDetailAsync(int userId)
        {
            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault();
            if (activeSemester == null) return null;

            var memberInfo = await _memberRepository.GetActiveMemberWithGroupInSemesterAsync(userId, activeSemester.SemesterId);
            if (memberInfo == null) return null;

            var group = await _groupRepository.GetGroupWithDetailsAsync(memberInfo.GroupId);
            if (group == null) return null;

            Project? activeProject = null;
            if (group.StatusId == StatusSubmitted)
                activeProject = group.Projects.FirstOrDefault(p => p.StatusId == ProjectStatusPending);
            else if (group.StatusId == StatusApproved)
                activeProject = group.Projects.FirstOrDefault(p => p.StatusId == ProjectStatusApproved);
            else if (group.StatusId == StatusForming)
                activeProject = group.Projects.OrderByDescending(p => p.ProjectId).FirstOrDefault(p => p.StatusId == ProjectStatusRejected);

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
                IsLeader = group.LeaderId == userId,
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
                        StatusName = m.Status?.StatusName ?? "",
                        TotalScore = m.User?.StudentFinalResults?.FirstOrDefault(r => r.SemesterId == activeSemester.SemesterId)?.TotalScore
                    }).ToList(),
                Project = activeProject != null ? new ProjectDto
                {
                    ProjectId = activeProject.ProjectId,
                    GroupId = activeProject.GroupId,
                    Title = activeProject.Title,
                    Description = activeProject.Description,
                    StatusId = activeProject.StatusId,
                    StatusName = activeProject.Status?.StatusName
                } : null
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
                    StatusName = m.Status?.StatusName ?? "",
                    TotalScore = m.User?.StudentFinalResults?.FirstOrDefault(r => r.SemesterId == group.SemesterId)?.TotalScore
                }).ToList()
            };
        }

        public async Task<InvitationDto> InviteMemberAsync(int leaderId, int groupId, string invitedEmail)
        {
            var group = await _groupRepository.GetGroupWithDetailsAsync(groupId)
                ?? throw new InvalidOperationException("Group not found.");

            if (group.LeaderId != leaderId)
                throw new InvalidOperationException("Only the group leader can invite members.");

            var invitedUser = await _userRepository.GetByEmailAsync(invitedEmail)
                ?? throw new InvalidOperationException($"No user found with email '{invitedEmail}'.");

            var invitedUserId = invitedUser.UserId;

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

        public async Task<MentorRequestDto> SendMentorInvitationAsync(int leaderId, int groupId, string mentorEmail, string? message)
        {
            var group = await _groupRepository.GetGroupWithDetailsAsync(groupId)
                ?? throw new InvalidOperationException("Group not found.");

            if (group.LeaderId != leaderId)
                throw new InvalidOperationException("Only the group leader can invite a mentor.");

            if (group.StatusId != StatusForming)
                throw new InvalidOperationException("Group must be in FORMING status (4�5 members) to invite a mentor.");

            if (group.MentorId != null)
                throw new InvalidOperationException("This group already has a mentor assigned.");

            var pendingRequest = await _mentorRequestRepository.GetPendingRequestByGroupAsync(groupId);
            if (pendingRequest != null)
                throw new InvalidOperationException("There is already a pending mentor invitation for this group. Please wait for a response.");

            var mentor = await _userRepository.GetByEmailAsync(mentorEmail)
                ?? throw new InvalidOperationException($"No teacher found with email '{mentorEmail}'.");

            var mentorUserId = mentor.UserId;

            if (mentor.StatusId != UserStatusActive)
                throw new InvalidOperationException("This teacher account is inactive.");

            if (mentor.Role?.RoleName != "TEACHER")
                throw new InvalidOperationException("The specified user is not a teacher.");

            var request = new MentorRequest
            {
                GroupId = groupId,
                UserId = mentorUserId,
                Message = message,
                StatusId = MentorRequestStatusPending,
                CreatedAt = DateTime.UtcNow
            };

            await _mentorRequestRepository.AddAsync(request);
            await _mentorRequestRepository.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(mentorUserId, new DTOs.Notification.CreateNotificationRequest
            {
                Title = "Mentor Invitation",
                Content = $"Group '{group.GroupName}' has invited you to be their mentor. MentorRequest ID: #{request.RequestId}."
            });

            return new MentorRequestDto
            {
                RequestId = request.RequestId,
                GroupId = groupId,
                GroupName = group.GroupName ?? "",
                LeaderId = group.LeaderId,
                LeaderName = group.Leader?.FullName ?? "",
                MentorUserId = mentorUserId,
                MentorUserName = mentor.FullName ?? "",
                Message = message,
                Status = "Pending",
                CreatedAt = request.CreatedAt
            };
        }

        public async Task<List<MentorRequestDto>> GetPendingMentorRequestsAsync(int teacherUserId)
        {
            var requests = await _mentorRequestRepository.GetPendingRequestsForTeacherAsync(teacherUserId);
            return requests.Select(r => new MentorRequestDto
            {
                RequestId = r.RequestId,
                GroupId = r.GroupId,
                GroupName = r.Group?.GroupName ?? "",
                LeaderId = r.Group?.LeaderId ?? 0,
                LeaderName = r.Group?.Leader?.FullName ?? "",
                MentorUserId = r.UserId,
                MentorUserName = "",
                Message = r.Message,
                Status = r.Status?.StatusName ?? "Pending",
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        public async Task<MentorRequestDetailDto?> GetMentorRequestDetailAsync(int teacherUserId, int requestId)
        {
            var request = await _mentorRequestRepository.GetRequestWithDetailsAsync(requestId);
            if (request == null || request.UserId != teacherUserId) return null;

            var group = request.Group;
            return new MentorRequestDetailDto
            {
                RequestId = request.RequestId,
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
                Message = request.Message,
                Status = request.Status?.StatusName ?? "Pending",
                CreatedAt = request.CreatedAt
            };
        }

        public async Task<GroupDto> RespondToMentorRequestAsync(int teacherUserId, int requestId, bool accept)
        {
            var request = await _mentorRequestRepository.GetRequestWithDetailsAsync(requestId)
                ?? throw new InvalidOperationException("Mentor request not found.");

            if (request.UserId != teacherUserId)
                throw new InvalidOperationException("You are not authorized to respond to this mentor request.");

            if (request.StatusId != MentorRequestStatusPending)
                throw new InvalidOperationException("This mentor request has already been processed.");

            if (!accept)
            {
                request.StatusId = MentorRequestStatusRejected;
                await _mentorRequestRepository.UpdateAsync(request);
                await _mentorRequestRepository.SaveChangesAsync();

                await _notificationService.CreateNotificationAsync(request.Group.LeaderId, new DTOs.Notification.CreateNotificationRequest
                {
                    Title = "Mentor Request Declined",
                    Content = $"Your mentor invitation for group '{request.Group.GroupName}' has been declined by the teacher."
                });

                var rejectedGroup = await _groupRepository.GetGroupWithDetailsAsync(request.GroupId);
                return MapGroupToDto(rejectedGroup!, teacherUserId);
            }

            var group = request.Group;

            if (group.MentorId != null)
                throw new InvalidOperationException("This group already has a mentor assigned.");

            group.MentorId = teacherUserId;
            await _groupRepository.UpdateAsync(group);

            request.StatusId = MentorRequestStatusAccepted;
            await _mentorRequestRepository.UpdateAsync(request);
            await _mentorRequestRepository.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(group.LeaderId, new DTOs.Notification.CreateNotificationRequest
            {
                Title = "Mentor Request Accepted",
                Content = $"Your mentor invitation has been accepted! Group '{group.GroupName}' now has a mentor assigned."
            });

            var updatedGroup = await _groupRepository.GetGroupWithDetailsAsync(request.GroupId);
            return MapGroupToDto(updatedGroup!, teacherUserId);
        }

        public async Task<ProjectDto> RegisterTopicAsync(int leaderId, int groupId, RegisterTopicRequestDto dto)
        {
            var group = await _groupRepository.GetGroupWithDetailsAsync(groupId)
                ?? throw new InvalidOperationException("Group not found.");

            if (group.LeaderId != leaderId)
                throw new InvalidOperationException("Only the group leader can register a topic.");

            if (group.MentorId == null)
                throw new InvalidOperationException("Your group must have a mentor before registering a topic.");

            if (group.StatusId != StatusForming)
                throw new InvalidOperationException("Topic can only be registered when the group is in FORMING status.");

            var existingPending = await _projectRepository.GetPendingTopicByGroupIdAsync(groupId);
            if (existingPending != null)
                throw new InvalidOperationException("Your group already has a topic pending review.");

            var project = new Project
            {
                GroupId = groupId,
                Title = dto.TopicName.Trim(),
                Description = dto.Description.Trim(),
                StatusId = ProjectStatusPending
            };

            await _projectRepository.AddAsync(project);

            group.StatusId = StatusSubmitted;
            await _groupRepository.UpdateAsync(group);

            await _projectRepository.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(group.MentorId.Value, new DTOs.Notification.CreateNotificationRequest
            {
                Title = "Topic Registration",
                Content = $"Group '{group.GroupName}' has submitted a topic for your review. Group ID: #{groupId}."
            });

            return new ProjectDto
            {
                ProjectId = project.ProjectId,
                GroupId = project.GroupId,
                Title = project.Title,
                Description = project.Description,
                StatusId = project.StatusId,
                StatusName = "PENDING"
            };
        }

        public async Task<ProjectDto> UpdateTopicAsync(int leaderId, int groupId, RegisterTopicRequestDto dto)
        {
            var group = await _groupRepository.GetGroupWithDetailsAsync(groupId)
                ?? throw new InvalidOperationException("Group not found.");

            if (group.LeaderId != leaderId)
                throw new InvalidOperationException("Only the group leader can update the topic.");

            if (group.StatusId != StatusForming)
                throw new InvalidOperationException("Topic can only be updated when the group is in FORMING status.");

            if (group.MentorId == null)
                throw new InvalidOperationException("Your group must have a mentor before updating the topic.");

            var rejectedProject = group.Projects
                .OrderByDescending(p => p.ProjectId)
                .FirstOrDefault(p => p.StatusId == ProjectStatusRejected)
                ?? throw new InvalidOperationException("No rejected topic found to update.");

            rejectedProject.Title = dto.TopicName.Trim();
            rejectedProject.Description = dto.Description.Trim();
            rejectedProject.StatusId = ProjectStatusPending;

            group.StatusId = StatusSubmitted;

            await _projectRepository.UpdateAsync(rejectedProject);
            await _groupRepository.UpdateAsync(group);
            await _projectRepository.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(group.MentorId.Value, new DTOs.Notification.CreateNotificationRequest
            {
                Title = "Topic Registration",
                Content = $"Group '{group.GroupName}' has submitted an updated topic for your review. Group ID: #{groupId}."
            });

            return new ProjectDto
            {
                ProjectId = rejectedProject.ProjectId,
                GroupId = rejectedProject.GroupId,
                Title = rejectedProject.Title,
                Description = rejectedProject.Description,
                StatusId = rejectedProject.StatusId,
                StatusName = "PENDING"
            };
        }

        public async Task<List<TopicReviewDto>> GetPendingTopicRequestsAsync(int teacherUserId)
        {
            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("No active semester found.");

            var groups = await _groupRepository.GetSubmittedGroupsByMentorAsync(activeSemester.SemesterId, teacherUserId);

            var result = new List<TopicReviewDto>();
            foreach (var group in groups)
            {
                var project = group.Projects.FirstOrDefault(p => p.StatusId == ProjectStatusPending);
                if (project == null) continue;

                result.Add(new TopicReviewDto
                {
                    ProjectId = project.ProjectId,
                    GroupId = group.GroupId,
                    GroupName = group.GroupName ?? "",
                    LeaderName = group.Leader?.FullName ?? "",
                    TopicName = project.Title ?? "",
                    Description = project.Description ?? ""
                });
            }

            return result;
        }

        public async Task<GroupDto> ReviewTopicAsync(int teacherUserId, int groupId, bool approve)
        {
            var group = await _groupRepository.GetGroupWithDetailsAsync(groupId)
                ?? throw new InvalidOperationException("Group not found.");

            if (group.MentorId != teacherUserId)
                throw new InvalidOperationException("You are not the mentor of this group.");

            if (group.StatusId != StatusSubmitted)
                throw new InvalidOperationException("This group does not have a topic pending review.");

            var project = await _projectRepository.GetPendingTopicByGroupIdAsync(groupId)
                ?? throw new InvalidOperationException("No pending topic found for this group.");

            if (approve)
            {
                project.StatusId = ProjectStatusApproved;
                group.StatusId = StatusApproved;

                await _projectRepository.UpdateAsync(project);
                await _groupRepository.UpdateAsync(group);
                await _projectRepository.SaveChangesAsync();

                await _notificationService.CreateNotificationAsync(group.LeaderId, new DTOs.Notification.CreateNotificationRequest
                {
                    Title = "Topic Approved",
                    Content = $"Your topic '{project.Title}' for group '{group.GroupName}' has been approved by your mentor."
                });
            }
            else
            {
                project.StatusId = ProjectStatusRejected;
                group.StatusId = StatusForming;

                await _projectRepository.UpdateAsync(project);
                await _groupRepository.UpdateAsync(group);
                await _projectRepository.SaveChangesAsync();

                await _notificationService.CreateNotificationAsync(group.LeaderId, new DTOs.Notification.CreateNotificationRequest
                {
                    Title = "Topic Rejected",
                    Content = $"Your topic '{project.Title}' for group '{group.GroupName}' has been rejected by your mentor. Please register a new topic."
                });
            }

            var updatedGroup = await _groupRepository.GetGroupWithDetailsAsync(groupId);
            return MapGroupToDto(updatedGroup!, teacherUserId);
        }

        public async Task LeaveGroupAsync(int userId)
        {
            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("No active semester found.");

            var memberInfo = await _memberRepository.GetActiveMemberWithGroupInSemesterAsync(userId, activeSemester.SemesterId);
            if (memberInfo == null)
                throw new InvalidOperationException("You are not a member of any group in the current semester.");

            var group = memberInfo.Group;

            if (group.LeaderId == userId)
                throw new InvalidOperationException("The group leader cannot leave the group.");

            if (group.StatusId >= StatusApproved)
                throw new InvalidOperationException("You cannot leave the group after the topic has been approved.");

            memberInfo.StatusId = MemberStatusLeft;
            await _memberRepository.UpdateAsync(memberInfo);

            var remainingCount = group.GroupMembers.Count(m => m.StatusId == MemberStatusActive && m.UserId != userId);
            if (remainingCount < MinMembersForForming && group.StatusId > StatusCreated)
            {
                group.StatusId = StatusCreated;
                await _groupRepository.UpdateAsync(group);
            }

            await _memberRepository.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(group.LeaderId, new DTOs.Notification.CreateNotificationRequest
            {
                Title = "Member Left Group",
                Content = $"A member has left your group '{group.GroupName}'."
            });
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
        public async Task<(List<GroupDto> Items, int TotalCount)> GetGroupsAsync(string? search, int pageNumber, int pageSize)
        {
            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("Kh�ng c� h?c k? n�o ?ang ho?t ??ng.");

            var (groups, totalCount) = await _groupRepository.GetGroupsInActiveSemesterAsync(
                activeSemester.SemesterId, search, pageNumber, pageSize);

            var items = groups.Select(g => new GroupDto
            {
                GroupId = g.GroupId,
                GroupName = g.GroupName ?? "",
                SemesterId = g.SemesterId,
                SemesterName = g.Semester?.SemesterName ?? "",
                LeaderId = g.LeaderId,
                LeaderName = g.Leader?.FullName ?? "",
                StatusId = g.StatusId,
                StatusName = g.Status?.StatusName ?? "",
                IsLeader = false,
                MemberCount = g.GroupMembers.Count(m => m.StatusId == 1)
            }).ToList();

            return (items, totalCount);
        }
        public async Task<List<TeacherGroupDto>> GetGroupsByTeacherAsync(int teacherId, int? semesterId = null)
        {
            var targetSemesterId = semesterId ?? (await _semesterRepository.FindAsync(s => s.IsActive == true)).FirstOrDefault()?.SemesterId
                ?? throw new InvalidOperationException("KhÃ´ng cÃ³ há»c ká»³ nÃ o Ä‘ang hoáº¡t Ä‘á»™ng.");

            var groups = await _groupRepository.GetGroupsByTeacherAsync(teacherId, targetSemesterId);

            var result = new List<TeacherGroupDto>();

            foreach (var group in groups)
            {
                var teacherGroup = new TeacherGroupDto
                {
                    GroupId = group.GroupId,
                    GroupName = group.GroupName ?? $"NhÃ³m {group.GroupId}",
                    MemberCount = group.GroupMembers.Count(m => m.StatusId == 1),
                    Students = group.GroupMembers
                        .Where(m => m.StatusId == 1)
                        .Select(m => new TeacherGroupMemberDto
                        {
                            UserId = m.UserId,
                            FullName = m.User?.FullName ?? $"User {m.UserId}",
                            Scores = m.User?.AssessmentScores?.ToDictionary(s => s.AssessmentId, s => s.Score) ?? new Dictionary<int, decimal?>(),
                            TotalScore = m.User?.StudentFinalResults?.FirstOrDefault(r => r.SemesterId == targetSemesterId)?.TotalScore
                        })
                        .ToList(),
                    TeacherComments = group.ProjectSubmissions
                        .Where(ps => !string.IsNullOrEmpty(ps.TeacherComment))
                        .GroupBy(ps => ps.AssessmentId)
                        .ToDictionary(g => g.Key, g => g.OrderByDescending(ps => ps.SubmittedAt).First().TeacherComment!),
                    SubmittedDocs = group.ProjectSubmissions
                        .OrderByDescending(s => s.SubmittedAt)
                        .Select(ps => new GroupSubmissionDto
                        {
                            Id = ps.SubmissionId,
                            Name = ps.FileName,
                            Url = ps.ReportUrl,
                            SubmittedAt = ps.SubmittedAt,
                            AssessmentId = ps.AssessmentId
                        })
                        .ToList()
                };

                result.Add(teacherGroup);
            }

            return result;
        }
    }
}