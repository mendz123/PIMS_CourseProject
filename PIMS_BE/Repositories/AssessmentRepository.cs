using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

/// <summary>Raw data trả về cho tính năng Student xem assessment của bản thân</summary>
public class StudentAssessmentRawData
{
    public Group            Group            { get; set; } = null!;
    public Semester         Semester         { get; set; } = null!;
    public Project?         Project          { get; set; }
    public List<Assessment> Assessments      { get; set; } = new();
    public List<AssessmentScore> Scores      { get; set; } = new();
    public DefenseSchedule? DefenseSchedule  { get; set; }
    public List<ProjectSubmission> Submissions { get; set; } = new();
    public StudentFinalResult? FinalResult   { get; set; }
}

public interface IAssessmentRepository : IGenericRepository<Assessment>
{
    Task<List<Assessment>> GetAssessmentsBySemesterAsync(int semesterId, bool includeRetake = false);
    Task<Assessment?> GetAssessmentWithCriteriaAsync(int assessmentId);
    Task<List<Assessment>> GetAssessmentsWithCriteriaAsync(int semesterId, bool includeRetake = false);
    Task<bool> HasScoresAsync(int assessmentId);
    Task<bool> HasSubmissionsAsync(int assessmentId);
    Task<decimal> GetTotalWeightBySemesterAsync(int semesterId, int? excludeAssessmentId = null);
    Task<IEnumerable<Assessment>> GetActiveAssessmentsAsync();
    Task<StudentAssessmentRawData?> GetStudentAssessmentDataAsync(int userId);
}

public class AssessmentRepository : GenericRepository<Assessment>, IAssessmentRepository
{
    private const int ProjectStatusPending = 1;
    private const int ProjectStatusApproved = 3;

    public AssessmentRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<List<Assessment>> GetAssessmentsBySemesterAsync(int semesterId, bool includeRetake = false)
    {
        return await _context.Assessments
            .Include(a => a.CreatedByNavigation)
            .Where(a => a.SemesterId == semesterId && (includeRetake || !a.IsRetake))
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<Assessment?> GetAssessmentWithCriteriaAsync(int assessmentId)
    {
        return await _context.Assessments
            .Include(a => a.AssessmentCriteria)
            .Include(a => a.CreatedByNavigation)
            .Include(a => a.ProjectSubmissions)
            .Include(a => a.AssessmentScores)
            .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId);
    }

    public async Task<List<Assessment>> GetAssessmentsWithCriteriaAsync(int semesterId, bool includeRetake = false)
    {
        return await _context.Assessments
            .Include(a => a.AssessmentCriteria)
            .Include(a => a.CreatedByNavigation)
            .Include(a => a.ProjectSubmissions)
            .Include(a => a.AssessmentScores)
            .Where(a => a.SemesterId == semesterId && (includeRetake || !a.IsRetake))
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> HasScoresAsync(int assessmentId)
    {
        return await _context.AssessmentScores
            .AnyAsync(s => s.AssessmentId == assessmentId);
    }

    public async Task<bool> HasSubmissionsAsync(int assessmentId)
    {
        return await _context.ProjectSubmissions
            .AnyAsync(s => s.AssessmentId == assessmentId);
    }

    public async Task<decimal> GetTotalWeightBySemesterAsync(int semesterId, int? excludeAssessmentId = null)
    {
        var query = _context.Assessments
            .Where(a => a.SemesterId == semesterId && !a.IsRetake);

        if (excludeAssessmentId.HasValue)
        {
            query = query.Where(a => a.AssessmentId != excludeAssessmentId.Value);
        }

        return await query.SumAsync(a => a.Weight ?? 0);
    }
        public async Task<IEnumerable<Assessment>> GetActiveAssessmentsAsync()
        {
            return await _context.Assessments
                .Include(a => a.Semester)
                .Where(a => a.Semester.IsActive == true &&  !a.IsRetake && a.IsFinal != true  )
                .ToListAsync();
        }

    public async Task<StudentAssessmentRawData?> GetStudentAssessmentDataAsync(int userId)
    {
        // 1. Tìm nhóm đang active của sinh viên trong học kỳ đang active
        var membership = await _context.GroupMembers
            .Include(gm => gm.Group)
                .ThenInclude(g => g.Semester)
            .Include(gm => gm.Group)
                .ThenInclude(g => g.Status)
            .Include(gm => gm.Group)
                .ThenInclude(g => g.Projects)
                    .ThenInclude(p => p.Status)
            .Where(gm => gm.UserId == userId
                      && gm.StatusId == 1 // ACTIVE
                      && gm.Group.Semester.IsActive == true)
            .FirstOrDefaultAsync();

        if (membership == null) return null;

        var group    = membership.Group;
        var semester = group.Semester;

        // Ưu tiên project đã được duyệt, nếu không có thì lấy bản pending mới nhất
        var project = group.Projects.FirstOrDefault(p => p.StatusId == ProjectStatusApproved)
               ?? group.Projects.OrderByDescending(p => p.ProjectId)
                .FirstOrDefault(p => p.StatusId == ProjectStatusPending);

        // 2. Lấy tất cả assessments của học kỳ đó (kèm criteria)
        var assessments = await _context.Assessments
            .Include(a => a.AssessmentCriteria)
            .Where(a => a.SemesterId == semester.SemesterId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();

        // 3. Lấy điểm của sinh viên cho các assessments
        var assessmentIds = assessments.Select(a => a.AssessmentId).ToList();
        var scores = await _context.AssessmentScores
            .Where(s => s.UserId == userId && assessmentIds.Contains(s.AssessmentId))
            .ToListAsync();

        // 4. Lấy lịch bảo vệ (defense schedule) của nhóm nếu có final assessment
        var hasFinal = assessments.Any(a => a.IsFinal == true);
        DefenseSchedule? defenseSchedule = null;
        if (hasFinal)
        {
            defenseSchedule = await _context.DefenseSchedules
                .Include(ds => ds.Room)
                .Where(ds => ds.GroupId == group.GroupId)
                .FirstOrDefaultAsync();
        }

        // 5. Lấy teacher comment từ ProjectSubmissions của nhóm
        var submissions = await _context.ProjectSubmissions
            .Where(ps => ps.GroupId == group.GroupId
                      && assessmentIds.Contains(ps.AssessmentId)
                      && ps.TeacherComment != null)
            .ToListAsync();

        // 6. Lấy FinalResult của sinh viên
        var finalResult = await _context.StudentFinalResults
            .FirstOrDefaultAsync(fr => fr.UserId == userId && fr.SemesterId == semester.SemesterId);

        return new StudentAssessmentRawData
        {
            Group           = group,
            Semester        = semester,
            Project         = project,
            Assessments     = assessments,
            Scores          = scores,
            DefenseSchedule = defenseSchedule,
            Submissions     = submissions,
            FinalResult     = finalResult
        };
    }
    }
