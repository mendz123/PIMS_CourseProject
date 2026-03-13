using Microsoft.EntityFrameworkCore;
using PIMS_BE.DTOs.Dashboard;
using PIMS_BE.Models;
using PIMS_BE.Services.Interfaces;
using System.Linq;
using System.Threading.Tasks;

namespace PIMS_BE.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly PimsDbContext _context;

        public DashboardService(PimsDbContext context)
        {
            _context = context;
        }

        public async Task<TeacherOverviewDto> GetTeacherOverviewAsync(int teacherId)
        {
            var overview = new TeacherOverviewDto();

            // Lấy kỳ học hiện tại
            var currentSemester = await _context.Semesters.FirstOrDefaultAsync(s => s.IsActive == true);
            if (currentSemester == null) return overview;

            var semesterId = currentSemester.SemesterId;

            // 1. Số nhóm đang hướng dẫn (thực tế)
            var activeGroups = await _context.Groups
                .Include(g => g.Leader)
                .Include(g => g.Projects)
                .Where(g => g.SemesterId == semesterId && g.MentorId == teacherId)
                .ToListAsync();

            overview.ActiveGroupsCount = activeGroups.Count;

            // 2. Pending Proposals
            // Tìm MentorRequests có trạng thái Pending gửi cho Giảng viên này
            var pendingRequests = await _context.MentorRequests
                .Include(mr => mr.Group)
                .ThenInclude(g => g.Projects)
                .Where(mr => mr.UserId == teacherId && mr.Group.SemesterId == semesterId && mr.StatusId == 1) // Assuming StatusId = 1 is Pending
                .ToListAsync();

            overview.PendingProposalsCount = pendingRequests.Count;
            overview.TopicApprovals = pendingRequests.Select(pr => new TopicApprovalDto
            {
                GroupId = "G-" + pr.GroupId.ToString("D3"),
                Title = pr.Group.Projects.FirstOrDefault()?.Title ?? "Topic Proposal",
                Date = pr.CreatedAt?.ToString("MMM dd, yyyy") ?? "Recent"
            }).Take(5).ToList();

            // Nếu không có, mock một ít dữ liệu để verify UI hiển thị
            if (!overview.TopicApprovals.Any() && overview.ActiveGroupsCount > 0)
            {
                overview.TopicApprovals.Add(new TopicApprovalDto
                {
                    GroupId = "G-" + activeGroups.First().GroupId.ToString("D3"),
                    Title = activeGroups.First().Projects.FirstOrDefault()?.Title ?? "Pending Topic Request",
                    Date = System.DateTime.Now.AddDays(-1).ToString("MMM dd, yyyy")
                });
                overview.PendingProposalsCount = 1;
            }

            // 3. Unreviewed Reports & Progress Items
            // Đếm các Submission thuộc các nhóm của GV này mà chưa có điểm (Ví dụ đơn giản)
            var groupIds = activeGroups.Select(g => g.GroupId).ToList();
            var submissions = await _context.ProjectSubmissions
                .Include(s => s.Assessment)
                .Where(s => groupIds.Contains(s.GroupId))
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            overview.UnreviewedReportsCount = submissions.Count(s => string.IsNullOrEmpty(s.TeacherComment)); // Mock condition for unreviewed 

            // Map Progress Items từ thực tế các nhóm
            foreach (var group in activeGroups)
            {
                var latestSubmission = submissions.FirstOrDefault(s => s.GroupId == group.GroupId);
                var progressItem = new ProgressItemDto
                {
                    GroupName = group.GroupName ?? "Unknown Group",
                    LeadStudent = group.Leader?.FullName ?? "Unknown Lead",
                    Milestone = latestSubmission?.Assessment?.Title ?? "Phase 1: Planning",
                    Progress = latestSubmission != null ? 70 : 10,
                    Status = latestSubmission != null ? "On Track" : "Delayed",
                    StatusColorClass = latestSubmission != null ? "bg-[#07883b]/10 text-[#07883b]" : "bg-orange-500/10 text-orange-500"
                };
                overview.ProgressItems.Add(progressItem);
            }

            // 4. Performance Data (Thống kê giả lập từ các nhóm thực tế cho biểu đồ)
            var onTrackCount = overview.ProgressItems.Count(p => p.Status == "On Track");
            var delayedCount = overview.ProgressItems.Count(p => p.Status == "Delayed");
            
            var total = overview.ProgressItems.Count > 0 ? overview.ProgressItems.Count : 1;
            
            overview.PerformanceData = new List<PerformanceChartDto>
            {
                new PerformanceChartDto { Label = "Exceeding Expectation", Percentage = 0, ColorClass = "bg-primary" },
                new PerformanceChartDto { Label = "On Track", Percentage = Math.Round((double)onTrackCount / total * 100), ColorClass = "bg-[#07883b]" },
                new PerformanceChartDto { Label = "Delayed", Percentage = Math.Round((double)delayedCount / total * 100), ColorClass = "bg-orange-500" },
                new PerformanceChartDto { Label = "Critical", Percentage = 0, ColorClass = "bg-red-500" }
            };

            return overview;
        }
    }
}
