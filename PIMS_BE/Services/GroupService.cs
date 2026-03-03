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
                throw new InvalidOperationException("T�n nh�m kh�ng ???c ?? tr?ng.");

            var semesters = await _semesterRepository.FindAsync(s => s.IsActive == true);
            var activeSemester = semesters.FirstOrDefault()
                ?? throw new InvalidOperationException("Kh�ng c� h?c k? n�o ?ang ho?t ??ng.");

            var alreadyInGroup = await _memberRepository.HasActiveMemberInSemesterAsync(userId, activeSemester.SemesterId);
            if (alreadyInGroup)
                throw new InvalidOperationException("B?n ?� l� th�nh vi�n c?a m?t nh�m trong h?c k? hi?n t?i.");

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

        public async Task<List<TeacherGroupDto>> GetGroupsByTeacherAsync(int teacherId, int? semesterId = null)
        {
            var targetSemesterId = semesterId ?? (await _semesterRepository.FindAsync(s => s.IsActive == true)).FirstOrDefault()?.SemesterId
                ?? throw new InvalidOperationException("Không có học kỳ nào đang hoạt động.");

            var groups = await _groupRepository.GetGroupsByTeacherAsync(teacherId, targetSemesterId);

            var result = new List<TeacherGroupDto>();

            foreach (var group in groups)
            {
                var teacherGroup = new TeacherGroupDto
                {
                    GroupId = group.GroupId,
                    GroupName = group.GroupName ?? "Nhóm $($group.GroupId)",
                    MemberCount = group.GroupMembers.Count(m => m.StatusId == 1),
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
    }
}
