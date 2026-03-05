using PIMS_BE.DTOs.Assessment;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Services;

public class AssessmentService : IAssessmentService
{
    private readonly IAssessmentRepository _assessmentRepository;
    private readonly IAssessmentCriterionRepository _criterionRepository;
    private readonly ISemesterRepository _semesterRepository;
    private readonly PimsDbContext _context;

    public AssessmentService(
        IAssessmentRepository assessmentRepository,
        IAssessmentCriterionRepository criterionRepository,
        ISemesterRepository semesterRepository,
        PimsDbContext context)
    {
        _assessmentRepository = assessmentRepository;
        _criterionRepository = criterionRepository;
        _semesterRepository = semesterRepository;
        _context = context;
    }

    public async Task<AssessmentDto> CreateAssessmentAsync(CreateAssessmentDto dto, int userId)
    {
        // Validate semester exists
        var semester = await _semesterRepository.GetByIdAsync(dto.SemesterId);
        if (semester == null)
        {
            throw new KeyNotFoundException($"Semester with ID {dto.SemesterId} not found");
        }

        // Validate total weight
        var currentTotalWeight = await _assessmentRepository.GetTotalWeightBySemesterAsync(dto.SemesterId);
        if (currentTotalWeight + dto.Weight > 100)
        {
            throw new InvalidOperationException(
                $"Total assessment weight exceeds 100%. Current: {currentTotalWeight}%, Attempting to add: {dto.Weight}%");
        }

        var assessment = new Assessment
        {
            SemesterId  = dto.SemesterId,
            Title       = dto.Title,
            Weight      = dto.Weight,
            IsFinal     = dto.IsFinal,
            IsLocked    = false,
            CreatedBy   = userId,
            CreatedAt   = DateTime.UtcNow,
            StartDate   = dto.StartDate,
            Deadline    = dto.Deadline,
            Description = dto.Description
        };

        await _assessmentRepository.AddAsync(assessment);
        await _assessmentRepository.SaveChangesAsync();

        return await MapToDto(assessment);
    }

    public async Task<AssessmentDto> UpdateAssessmentAsync(int assessmentId, UpdateAssessmentDto dto, int userId)
    {
        var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        // Check if locked
        if (assessment.IsLocked == true && dto.Weight.HasValue)
        {
            throw new InvalidOperationException("Cannot modify weight of a locked assessment");
        }

        // Validate weight if being updated
        if (dto.Weight.HasValue)
        {
            var currentTotalWeight = await _assessmentRepository
                .GetTotalWeightBySemesterAsync(assessment.SemesterId, assessmentId);

            if (currentTotalWeight + dto.Weight.Value > 100)
            {
                throw new InvalidOperationException(
                    $"Total assessment weight would exceed 100%. Current (excluding this): {currentTotalWeight}%, New value: {dto.Weight.Value}%");
            }

            assessment.Weight = dto.Weight.Value;
        }

        if (!string.IsNullOrEmpty(dto.Title))
        {
            assessment.Title = dto.Title;
        }

        if (dto.IsFinal.HasValue)
        {
            assessment.IsFinal = dto.IsFinal.Value;
        }

        if (dto.IsLocked.HasValue)
        {
            assessment.IsLocked = dto.IsLocked.Value;
        }

        if (dto.StartDate.HasValue)
        {
            assessment.StartDate = dto.StartDate.Value;
        }

        if (dto.Deadline.HasValue)
        {
            assessment.Deadline = dto.Deadline.Value;
        }

        if (dto.Description != null)
        {
            assessment.Description = dto.Description;
        }

        _assessmentRepository.Update(assessment);
        await _assessmentRepository.SaveChangesAsync();

        return await MapToDto(assessment);
    }

    public async Task DeleteAssessmentAsync(int assessmentId, int userId)
    {
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        // Check if has scores
        var hasScores = await _assessmentRepository.HasScoresAsync(assessmentId);
        if (hasScores)
        {
            throw new InvalidOperationException("Cannot delete assessment with existing scores");
        }

        // Check if has submissions
        var hasSubmissions = await _assessmentRepository.HasSubmissionsAsync(assessmentId);
        if (hasSubmissions)
        {
            throw new InvalidOperationException("Cannot delete assessment because students have already submitted for it");
        }

        // Delete all criteria first
        await _criterionRepository.DeleteByAssessmentIdAsync(assessmentId);

        _assessmentRepository.Remove(assessment);
        await _assessmentRepository.SaveChangesAsync();
    }

    public async Task<AssessmentDto?> GetAssessmentByIdAsync(int assessmentId)
    {
        var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(assessmentId);
        if (assessment == null)
        {
            return null;
        }

        return await MapToDto(assessment);
    }

    public async Task<List<AssessmentDto>> GetAssessmentsBySemesterAsync(int semesterId)
    {
        var assessments = await _assessmentRepository.GetAssessmentsBySemesterAsync(semesterId);
        var dtos = new List<AssessmentDto>();

        foreach (var assessment in assessments)
        {
            dtos.Add(await MapToDto(assessment));
        }

        return dtos;
    }

    public async Task<AssessmentWithCriteriaDto?> GetAssessmentWithCriteriaAsync(int assessmentId)
    {
        var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(assessmentId);
        if (assessment == null)
        {
            return null;
        }

        return MapToWithCriteriaDto(assessment);
    }

    public async Task<List<AssessmentWithCriteriaDto>> GetAssessmentsWithCriteriaAsync(int semesterId)
    {
        var assessments = await _assessmentRepository.GetAssessmentsWithCriteriaAsync(semesterId);
        return assessments.Select(MapToWithCriteriaDto).ToList();
    }

    public async Task LockAssessmentAsync(int assessmentId, int userId)
    {
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        assessment.IsLocked = true;
        _assessmentRepository.Update(assessment);
        await _assessmentRepository.SaveChangesAsync();
    }

    public async Task UnlockAssessmentAsync(int assessmentId, int userId)
    {
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        // Check if assessment has scores - cannot unlock if scores exist
        var hasScores = await _assessmentRepository.HasScoresAsync(assessmentId);
        if (hasScores)
        {
            throw new InvalidOperationException(
                "Cannot unlock assessment because scores have been recorded. " +
                "Unlocking would allow changes to criteria which could invalidate existing scores.");
        }

        assessment.IsLocked = false;
        _assessmentRepository.Update(assessment);
        await _assessmentRepository.SaveChangesAsync();
    }

    public async Task<bool> ValidateAssessmentWeightsAsync(int semesterId, int? excludeAssessmentId = null)
    {
        var totalWeight = await _assessmentRepository
            .GetTotalWeightBySemesterAsync(semesterId, excludeAssessmentId);
        return totalWeight == 100m;
    }

    private Task<AssessmentDto> MapToDto(Assessment assessment)
    {
        return Task.FromResult(new AssessmentDto
        {
            AssessmentId  = assessment.AssessmentId,
            SemesterId    = assessment.SemesterId,
            Title         = assessment.Title ?? string.Empty,
            Weight        = assessment.Weight ?? 0,
            IsFinal       = assessment.IsFinal ?? false,
            IsLocked      = assessment.IsLocked ?? false,
            CreatedBy     = assessment.CreatedBy,
            CreatedAt     = assessment.CreatedAt ?? DateTime.UtcNow,
            CreatedByName = assessment.CreatedByNavigation?.FullName ?? "Unknown",
            StartDate     = assessment.StartDate,
            Deadline      = assessment.Deadline,
            Description   = assessment.Description,
            Criteria = assessment.AssessmentCriteria?.Select(c => new AssessmentCriterionDto
            {
                CriteriaId   = c.CriteriaId,
                AssessmentId = c.AssessmentId,
                CriteriaName = c.CriteriaName ?? string.Empty,
                Weight       = c.Weight ?? 0
            }).ToList()
        });
    }

    private AssessmentWithCriteriaDto MapToWithCriteriaDto(Assessment assessment)
    {
        var criteria = assessment.AssessmentCriteria.Select(c => new AssessmentCriterionDto
        {
            CriteriaId = c.CriteriaId,
            AssessmentId = c.AssessmentId,
            CriteriaName = c.CriteriaName ?? string.Empty,
            Weight = c.Weight ?? 0
        }).ToList();

        return new AssessmentWithCriteriaDto
        {
            AssessmentId        = assessment.AssessmentId,
            Title               = assessment.Title ?? string.Empty,
            Weight              = assessment.Weight ?? 0,
            IsFinal             = assessment.IsFinal ?? false,
            IsLocked            = assessment.IsLocked ?? false,
            StartDate           = assessment.StartDate,
            Deadline            = assessment.Deadline,
            Description         = assessment.Description,
            HasSubmissions      = assessment.ProjectSubmissions?.Count > 0,
            HasScores           = assessment.AssessmentScores?.Count > 0,
            Criteria            = criteria,
            TotalCriteriaWeight = criteria.Sum(c => c.Weight)
        };
    }

    public async Task<IEnumerable<DeadlineAssessmentDto>> GetActiveIterations()
    {
        var data = await _assessmentRepository.GetActiveAssessmentsAsync();
        
        return data.Select(a => new DeadlineAssessmentDto
        {
            AssessmentId = a.AssessmentId,
            Title = a.Title,
            Deadline = a.Deadline,
            Description = a.Description
        });
    }


    public async Task<bool> SaveGradesAsync(SaveGradesDto dto, int teacherId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Update ProjectSubmission Comment
            var submission = await _context.ProjectSubmissions
                .FirstOrDefaultAsync(ps => ps.GroupId == dto.GroupId && ps.AssessmentId == dto.AssessmentId);

            if (submission != null && !string.IsNullOrEmpty(dto.TeacherComment))
            {
                submission.TeacherComment = dto.TeacherComment;
                _context.ProjectSubmissions.Update(submission);
            }

            // 2. Update AssessmentScores
            foreach (var studentScore in dto.StudentScores)
            {
                var existingScore = await _context.AssessmentScores
                    .FirstOrDefaultAsync(s => s.AssessmentId == dto.AssessmentId && s.UserId == studentScore.UserId);

                if (existingScore != null)
                {
                    existingScore.Score = studentScore.Score;
                    existingScore.IsPassed = studentScore.Score >= 5; // Assuming 5 is pass
                    _context.AssessmentScores.Update(existingScore);
                }
                else
                {
                    var newScore = new AssessmentScore
                    {
                        AssessmentId = dto.AssessmentId,
                        UserId = studentScore.UserId,
                        Score = studentScore.Score,
                        IsPassed = studentScore.Score >= 5
                    };
                    await _context.AssessmentScores.AddAsync(newScore);
                }
            }

            // Save first to ensure the new scores are in the context/DB before recalculating
            await _context.SaveChangesAsync();

            // 3. Recalculate Total Score for modified students in the current semester
            var assessment = await _context.Assessments.FindAsync(dto.AssessmentId);
            if (assessment != null)
            {
                var semesterId = assessment.SemesterId;
                var assessmentsInSemester = await _context.Assessments
                    .Where(a => a.SemesterId == semesterId)
                    .ToListAsync();

                var studentIds = dto.StudentScores.Select(s => s.UserId).ToList();

                var allScoresForStudents = await _context.AssessmentScores
                    .Where(s => studentIds.Contains(s.UserId) && assessmentsInSemester.Select(a => a.AssessmentId).Contains(s.AssessmentId))
                    .ToListAsync();

                foreach (var studentId in studentIds)
                {
                    decimal totalScore = 0;
                    foreach (var a in assessmentsInSemester)
                    {
                        var score = allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == a.AssessmentId)?.Score ?? 0;
                        totalScore += score * (a.Weight ?? 0) / 100m;
                    }

                    var finalResult = await _context.StudentFinalResults
                        .FirstOrDefaultAsync(r => r.UserId == studentId && r.SemesterId == semesterId);

                    if (finalResult != null)
                    {
                        finalResult.TotalScore = totalScore;
                        _context.StudentFinalResults.Update(finalResult);
                    }
                    else
                    {
                        finalResult = new StudentFinalResult
                        {
                            UserId = studentId,
                            SemesterId = semesterId,
                            TotalScore = totalScore
                        };
                        await _context.StudentFinalResults.AddAsync(finalResult);
                    }
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("Error saving grades: " + ex.Message);
        }
    }

   

    public async Task<StudentMyAssessmentsDto?> GetMyAssessmentsAsync(int userId)
    {
        var raw = await _assessmentRepository.GetStudentAssessmentDataAsync(userId);
        if (raw == null) return null;

        // Map điểm theo assessmentId để tra cứu nhanh
        var scoreMap = raw.Scores.ToDictionary(s => s.AssessmentId, s => s);

        // Map teacher comment theo assessmentId (lấy comment mới nhất)
        var commentMap = raw.Submissions
            .GroupBy(ps => ps.AssessmentId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderByDescending(ps => ps.SubmittedAt).First().TeacherComment);

        var items = raw.Assessments.Select(a =>
        {
            scoreMap.TryGetValue(a.AssessmentId, out var scoreEntry);
            commentMap.TryGetValue(a.AssessmentId, out var teacherComment);

            var item = new StudentAssessmentItemDto
            {
                AssessmentId  = a.AssessmentId,
                Title         = a.Title ?? string.Empty,
                Weight        = a.Weight ?? 0,
                IsFinal       = a.IsFinal ?? false,
                StartDate     = a.StartDate,
                Deadline      = a.Deadline,
                Description   = a.Description,
                Score         = scoreEntry?.Score,
                IsPassed      = scoreEntry?.IsPassed,
                TeacherComment = teacherComment,
            };

            // Nếu là final: gắn thêm thông tin lịch bảo vệ
            if (item.IsFinal && raw.DefenseSchedule != null)
            {
                var ds = raw.DefenseSchedule;
                item.DefenseDate      = ds.DefenseDate;
                item.DefenseStartTime = ds.StartTime;
                item.DefenseEndTime   = ds.EndTime;
                item.RoomId           = ds.RoomId;
                item.RoomName         = ds.Room?.RoomName;
                item.RoomLocation     = ds.Location ?? ds.Room?.Building;
                item.DefenseStatus    = ds.Status;
            }

            return item;
        }).ToList();

        return new StudentMyAssessmentsDto
        {
            ProjectId          = raw.Project?.ProjectId,
            ProjectTitle       = raw.Project?.Title,
            ProjectDescription = raw.Project?.Description,
            GroupId            = raw.Group.GroupId,
            GroupName          = raw.Group.GroupName ?? string.Empty,
            SemesterId         = raw.Semester.SemesterId,
            SemesterName       = raw.Semester.SemesterName ?? string.Empty,
            Assessments        = items
        };
    }

    public async Task<bool> SaveGradesByCriteriaAsync(SaveGradesByCriteriaDto dto, int teacherId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var assessment = await _context.Assessments
                .Include(a => a.AssessmentCriteria)
                .FirstOrDefaultAsync(a => a.AssessmentId == dto.AssessmentId);

            if (assessment == null)
                throw new Exception("Assessment not found");

            var criteriaDict = assessment.AssessmentCriteria.ToDictionary(c => c.CriteriaId, c => c.Weight ?? 0);

            // 1. Cập nhật Comment của Giáo viên vào Submission
            var submission = await _context.ProjectSubmissions
                .FirstOrDefaultAsync(ps => ps.GroupId == dto.GroupId && ps.AssessmentId == dto.AssessmentId);

            if (submission != null && !string.IsNullOrEmpty(dto.TeacherComment))
            {
                submission.TeacherComment = dto.TeacherComment;
                _context.ProjectSubmissions.Update(submission);
            }

            // 2. Cập nhật Điểm tiêu chí và tính Tổng điểm đợt (AssessmentScore)
            foreach (var studentData in dto.StudentScores)
            {
                decimal totalAssessmentScore = 0;

                foreach (var (criteriaId, score) in studentData.CriteriaScores)
                {
                    // Lưu/Cập nhật CriteriaGrade (Bảng điểm cho từng tiêu chí)
                    var existingCriteriaGrade = await _context.CriteriaGrades
                        .FirstOrDefaultAsync(cg => cg.UserId == studentData.UserId && cg.CriteriaId == criteriaId);

                    if (existingCriteriaGrade != null)
                    {
                        existingCriteriaGrade.Score = score;
                        existingCriteriaGrade.TeacherId = teacherId;
                        _context.CriteriaGrades.Update(existingCriteriaGrade);
                    }
                    else
                    {
                        var newCriteriaGrade = new CriteriaGrade
                        {
                            UserId = studentData.UserId,
                            CriteriaId = criteriaId,
                            TeacherId = teacherId,
                            Score = score
                        };
                        await _context.CriteriaGrades.AddAsync(newCriteriaGrade);
                    }

                    // Cộng dồn vào tổng điểm đợt (Nhân hệ số tiêu chí)
                    if (criteriaDict.TryGetValue(criteriaId, out var criteriaWeight))
                    {
                        totalAssessmentScore += score * (criteriaWeight / 100m);
                    }
                }

                // Lưu/Cập nhật AssessmentScore (Tổng điểm của đợt)
                var existingAssessmentScore = await _context.AssessmentScores
                    .FirstOrDefaultAsync(s => s.AssessmentId == dto.AssessmentId && s.UserId == studentData.UserId);

                if (existingAssessmentScore != null)
                {
                    existingAssessmentScore.Score = totalAssessmentScore;
                    existingAssessmentScore.IsPassed = totalAssessmentScore >= 5;
                    _context.AssessmentScores.Update(existingAssessmentScore);
                }
                else
                {
                    var newScore = new AssessmentScore
                    {
                        AssessmentId = dto.AssessmentId,
                        UserId = studentData.UserId,
                        Score = totalAssessmentScore,
                        IsPassed = totalAssessmentScore >= 5
                    };
                    await _context.AssessmentScores.AddAsync(newScore);
                }
            }

            // Lưu thay đổi để hàm tính tổng môn (StudentFinalResult) lấy được dữ liệu chuẩn
            await _context.SaveChangesAsync();

            // 3. Tính lại Tổng Kết Môn (StudentFinalResult)
            var semesterId = assessment.SemesterId;
            var assessmentsInSemester = await _context.Assessments
                .Where(a => a.SemesterId == semesterId)
                .ToListAsync();

            var studentIds = dto.StudentScores.Select(s => s.UserId).ToList();

            var allScoresForStudents = await _context.AssessmentScores
                .Where(s => studentIds.Contains(s.UserId) && assessmentsInSemester.Select(a => a.AssessmentId).Contains(s.AssessmentId))
                .ToListAsync();

            foreach (var studentId in studentIds)
            {
                decimal finalSubjectScore = 0;
                foreach (var a in assessmentsInSemester)
                {
                    var score = allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == a.AssessmentId)?.Score ?? 0;
                    finalSubjectScore += score * (a.Weight ?? 0) / 100m;
                }

                var finalResult = await _context.StudentFinalResults
                    .FirstOrDefaultAsync(r => r.UserId == studentId && r.SemesterId == semesterId);

                if (finalResult != null)
                {
                    finalResult.TotalScore = finalSubjectScore;
                    _context.StudentFinalResults.Update(finalResult);
                }
                else
                {
                    finalResult = new StudentFinalResult
                    {
                        UserId = studentId,
                        SemesterId = semesterId,
                        TotalScore = finalSubjectScore
                    };
                    await _context.StudentFinalResults.AddAsync(finalResult);
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("Error saving grades by criteria: " + ex.Message);
        }
    }
}
