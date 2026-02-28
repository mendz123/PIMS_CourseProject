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

        public GroupService(
            IGroupRepository groupRepository,
            IMemberRepository memberRepository,
            ISemesterRepository semesterRepository)
        {
            _groupRepository = groupRepository;
            _memberRepository = memberRepository;
            _semesterRepository = semesterRepository;
        }

        public async Task<GroupDto> CreateGroupAsync(int userId, string groupName)
        {
            if (string.IsNullOrWhiteSpace(groupName))
                throw new InvalidOperationException("Tên nhóm không ???c ?? tr?ng.");

            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("Không có h?c k? nào ?ang ho?t ??ng.");

            var alreadyInGroup = await _memberRepository.HasActiveMemberInSemesterAsync(userId, activeSemester.SemesterId);
            if (alreadyInGroup)
                throw new InvalidOperationException("B?n ?ã là thành viên c?a m?t nhóm trong h?c k? hi?n t?i.");

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
                ?? throw new InvalidOperationException("Không có h?c k? nào ?ang ho?t ??ng.");

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
    }
}
