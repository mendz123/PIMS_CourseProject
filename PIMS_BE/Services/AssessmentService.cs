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
    private readonly IProjectSubmissionRepository _submissionRepository;
    private readonly ICouncilRepository _councilRepository;
    private readonly ICouncilCriteriaGradeRepository _councilGradeRepository;
    private readonly IAssessmentScoreRepository _assessmentScoreRepository;
    private readonly IStudentFinalResultRepository _finalResultRepository;
    private readonly IDefenseScheduleRepository _defenseScheduleRepository;
    private readonly ICriteriaGradeRepository _criteriaGradeRepository;
    private readonly PimsDbContext _context;

    public AssessmentService(
        IAssessmentRepository assessmentRepository,
        IAssessmentCriterionRepository criterionRepository,
        ISemesterRepository semesterRepository,
        IProjectSubmissionRepository submissionRepository,
        ICouncilRepository councilRepository,
        ICouncilCriteriaGradeRepository councilGradeRepository,
        IAssessmentScoreRepository assessmentScoreRepository,
        IStudentFinalResultRepository finalResultRepository,
        IDefenseScheduleRepository defenseScheduleRepository,
        ICriteriaGradeRepository criteriaGradeRepository,
        PimsDbContext context)
    {
        _assessmentRepository = assessmentRepository;
        _criterionRepository = criterionRepository;
        _semesterRepository = semesterRepository;
        _submissionRepository = submissionRepository;
        _councilRepository = councilRepository;
        _councilGradeRepository = councilGradeRepository;
        _assessmentScoreRepository = assessmentScoreRepository;
        _finalResultRepository = finalResultRepository;
        _defenseScheduleRepository = defenseScheduleRepository;
        _criteriaGradeRepository = criteriaGradeRepository;
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

        if (dto.IsFinal)
        {
            var retakeAssessment = new Assessment
            {
                SemesterId  = dto.SemesterId,
                Title       = dto.Title + " (Retake)",
                Weight      = dto.Weight,
                IsFinal     = false,
                IsRetake    = true,
                IsLocked    = false,
                CreatedBy   = userId,
                CreatedAt   = DateTime.UtcNow,
                StartDate   = dto.StartDate,
                Deadline    = dto.Deadline,
                Description = string.IsNullOrEmpty(dto.Description) ? "Retake for Final Assessment" : dto.Description + " (Retake)"
            };

            await _assessmentRepository.AddAsync(retakeAssessment);
            await _assessmentRepository.SaveChangesAsync();
        }

        return await MapToDto(assessment);
    }

    public async Task<List<AssessmentDto>> BatchCreateAssessmentsAsync(BatchCreateAssessmentsDto dto, int userId)
    {
        // Validate semester exists
        var semester = await _semesterRepository.GetByIdAsync(dto.SemesterId);
        if (semester == null)
        {
            throw new KeyNotFoundException($"Semester with ID {dto.SemesterId} not found");
        }

        // Validate total weight of batch equals exactly 100
        var totalWeight = dto.Assessments.Sum(a => a.Weight);
        if (Math.Abs(totalWeight - 100m) > 0.01m)
        {
            throw new InvalidOperationException(
                $"Total assessment weight must be exactly 100%. Currently: {totalWeight}%");
        }

        var createdAssessments = new List<Assessment>();
        foreach (var item in dto.Assessments)
        {
            var assessment = new Assessment
            {
                SemesterId  = dto.SemesterId,
                Title       = item.Title,
                Weight      = item.Weight,
                IsFinal     = item.IsFinal,
                IsLocked    = false,
                CreatedBy   = userId,
                CreatedAt   = DateTime.UtcNow,
                StartDate   = item.StartDate,
                Deadline    = item.Deadline,
                Description = item.Description
            };
            await _assessmentRepository.AddAsync(assessment);
            createdAssessments.Add(assessment);

            if (item.IsFinal)
            {
                var retakeAssessment = new Assessment
                {
                    SemesterId  = dto.SemesterId,
                    Title       = item.Title + " (Retake)",
                    Weight      = item.Weight,
                    IsFinal     = false,
                    IsRetake    = true,
                    IsLocked    = false,
                    CreatedBy   = userId,
                    CreatedAt   = DateTime.UtcNow,
                    StartDate   = item.StartDate,
                    Deadline    = item.Deadline,
                    Description = string.IsNullOrEmpty(item.Description) ? "Retake for Final Assessment" : item.Description + " (Retake)"
                };
                await _assessmentRepository.AddAsync(retakeAssessment);
            }
        }

        await _assessmentRepository.SaveChangesAsync();

        var dtos = new List<AssessmentDto>();
        foreach (var a in createdAssessments)
        {
            dtos.Add(await MapToDto(a));
        }
        return dtos;
    }

    public async Task<AssessmentDto> UpdateAssessmentAsync(int assessmentId, UpdateAssessmentDto dto, int userId)
    {
        var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        string? oldTitle = assessment.Title;
        int semesterId = assessment.SemesterId;
        bool? wasFinal = assessment.IsFinal;

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

        // Propagation to Retake
        if (wasFinal == true)
        {
            string retakeTitleToSearch = (oldTitle ?? "") + " (Retake)";
            var retakes = await _assessmentRepository.FindAsync(a => 
                a.SemesterId == semesterId && 
                a.IsRetake == true && 
                a.Title == retakeTitleToSearch);
            
            var retake = retakes.FirstOrDefault();
            if (retake != null)
            {
                if (!string.IsNullOrEmpty(dto.Title))
                {
                    retake.Title = dto.Title + " (Retake)";
                }
                if (dto.Weight.HasValue)
                {
                    retake.Weight = dto.Weight.Value;
                }
                if (dto.Description != null)
                {
                    retake.Description = dto.Description + " (Retake)";
                }
                if (dto.StartDate.HasValue)
                {
                    retake.StartDate = dto.StartDate.Value;
                }
                if (dto.Deadline.HasValue)
                {
                    retake.Deadline = dto.Deadline.Value;
                }
                if (dto.IsLocked.HasValue) 
                {
                    retake.IsLocked = dto.IsLocked.Value;
                }

                _assessmentRepository.Update(retake);
                await _assessmentRepository.SaveChangesAsync();
            }
        }

        return await MapToDto(assessment);
    }

    public async Task DeleteAssessmentAsync(int assessmentId, int userId)
    {
        var assessment = await _assessmentRepository.GetByIdAsync(assessmentId);
        if (assessment == null)
        {
            throw new KeyNotFoundException($"Assessment with ID {assessmentId} not found");
        }

        string titleForRetake = (assessment.Title ?? "") + " (Retake)";
        int semesterId = assessment.SemesterId;
        bool? isFinal = assessment.IsFinal;

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

        // PROPAGATION: Delete Retake as well if this was a Final Assessment
        if (isFinal == true)
        {
            var retakes = await _assessmentRepository.FindAsync(a => 
                a.SemesterId == semesterId && 
                a.IsRetake == true && 
                a.Title == titleForRetake);
            
            var retake = retakes.FirstOrDefault();
            if (retake != null) {
                await _criterionRepository.DeleteByAssessmentIdAsync(retake.AssessmentId);
                _assessmentRepository.Remove(retake);
            }
        }

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

    public async Task<List<AssessmentDto>> GetAssessmentsBySemesterAsync(int semesterId, bool includeRetake = false)
    {
        var assessments = await _assessmentRepository.GetAssessmentsBySemesterAsync(semesterId, includeRetake);
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

    public async Task<List<AssessmentWithCriteriaDto>> GetAssessmentsWithCriteriaAsync(int semesterId, bool includeRetake = false)
    {
        var assessments = await _assessmentRepository.GetAssessmentsWithCriteriaAsync(semesterId, includeRetake);
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
            IsRetake      = assessment.IsRetake,
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
            IsRetake            = assessment.IsRetake,
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
            var assessment = await _assessmentRepository.GetByIdAsync(dto.AssessmentId);
            decimal passThreshold = (assessment?.IsFinal == true || assessment?.IsRetake == true) ? 4 : 5;

            // 1. Update ProjectSubmission Comment
            var submission = await _submissionRepository.GetByGroupAndAssessmentAsync(dto.GroupId, dto.AssessmentId);

            if (submission != null && !string.IsNullOrEmpty(dto.TeacherComment))
            {
                submission.TeacherComment = dto.TeacherComment;
                _submissionRepository.Update(submission);
            }

            // 2. Update AssessmentScores
            foreach (var studentScore in dto.StudentScores)
            {
                var existingScore = await _assessmentScoreRepository.GetByAssessmentAndUserAsync(dto.AssessmentId, studentScore.UserId);

                if (existingScore != null)
                {
                    existingScore.Score = studentScore.Score;
                    existingScore.IsPassed = studentScore.Score >= passThreshold;
                    _assessmentScoreRepository.Update(existingScore);
                }
                else
                {
                    var newScore = new AssessmentScore
                    {
                        AssessmentId = dto.AssessmentId,
                        UserId = studentScore.UserId,
                        Score = studentScore.Score,
                        IsPassed = studentScore.Score >= passThreshold
                    };
                    await _assessmentScoreRepository.AddAsync(newScore);
                }
            }

            await _assessmentRepository.SaveChangesAsync();

            // 3. Recalculate Total Score for modified students in the current semester
            if (assessment != null)
            {
                var semesterId = assessment.SemesterId;
                var assessmentsInSemester = await _assessmentRepository.GetAssessmentsBySemesterAsync(semesterId, true);

                var studentIds = dto.StudentScores.Select(s => s.UserId).ToList();

                var allScoresForStudents = await _assessmentScoreRepository.GetByAssessmentsAndUsersAsync(
                    assessmentsInSemester.Select(a => a.AssessmentId).ToList(), 
                    studentIds);

                foreach (var studentId in studentIds)
                {
                    decimal currentTotal = 0;
                    bool failedFinal = false;
                    bool finalExists = false;
                    bool hasAllFinalScores = true;
                    bool hasAnyFinalOrRetakeScore = false;

                    // Group assessments by base original title to handle overrides
                    var assessmentsByBaseTitle = assessmentsInSemester
                        .Where(a => a.IsRetake == false)
                        .ToList();

                    foreach (var a in assessmentsByBaseTitle)
                    {
                        var retakeAssessment = assessmentsInSemester.FirstOrDefault(ra => 
                            ra.IsRetake == true && 
                            a.Title != null && ra.Title != null && ra.Title.ToLower().Contains(a.Title.ToLower()) &&
                            ra.Title.ToLower().Contains("retake") &&
                            ra.SemesterId == a.SemesterId);

                        var origScoreEntry = allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == a.AssessmentId);
                        var retakeScoreEntry = retakeAssessment != null 
                            ? allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == retakeAssessment.AssessmentId) 
                            : null;

                        var effectiveScore = retakeScoreEntry?.Score ?? origScoreEntry?.Score ?? 0;
                        currentTotal += effectiveScore * (a.Weight ?? 0) / 100m;

                        if (a.IsFinal == true)
                        {
                            finalExists = true;
                            if (origScoreEntry == null && retakeScoreEntry == null) hasAllFinalScores = false;
                            if (origScoreEntry != null || retakeScoreEntry != null) hasAnyFinalOrRetakeScore = true;
                            
                            // A student fails the final requirement if their LATEST score (Retake >= Final) is < 4
                            if (effectiveScore < 4) failedFinal = true;
                        }
                    }

                    var finalResult = await _finalResultRepository.GetByUserAndSemesterAsync(studentId, semesterId);
                    
                    // Calculation visibility: Only record TotalScore if at least one Final-related score exists
                    decimal? totalScoreToSave = hasAnyFinalOrRetakeScore ? currentTotal : (decimal?)null;
                    bool? isPassedToSave = hasAnyFinalOrRetakeScore ? (currentTotal >= 5 && !failedFinal) : (bool?)null;

                    if (finalResult != null)
                    {
                        finalResult.TotalScore = totalScoreToSave;
                        finalResult.IsPassed = isPassedToSave;
                        _finalResultRepository.Update(finalResult);
                    }
                    else if (hasAnyFinalOrRetakeScore)
                    {
                        finalResult = new StudentFinalResult
                        {
                            UserId = studentId,
                            SemesterId = semesterId,
                            TotalScore = totalScoreToSave,
                            IsPassed = isPassedToSave
                        };
                        await _finalResultRepository.AddAsync(finalResult);
                    }
                }
            }

            await _assessmentRepository.SaveChangesAsync();

            // 4. Auto-lock assessment when grades are saved
            if (assessment != null && assessment.IsLocked != true)
            {
                assessment.IsLocked = true;
                _assessmentRepository.Update(assessment);
                await _assessmentRepository.SaveChangesAsync();
            }

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

        var scheduleQueue = raw.DefenseSchedules
            .OrderBy(ds => ds.DefenseDate)
            .ThenBy(ds => ds.StartTime)
            .ThenBy(ds => ds.ScheduleId)
            .ToList();
        var finalAttemptIndex = 0;

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
                IsRetake      = a.IsRetake,
                StartDate     = a.StartDate,
                Deadline      = a.Deadline,
                Description   = a.Description,
                Score         = scoreEntry?.Score,
                IsPassed      = scoreEntry?.IsPassed,
                TeacherComment = teacherComment,
                Criteria      = a.AssessmentCriteria.Select(c => new AssessmentCriterionDto
                {
                    CriteriaId   = c.CriteriaId,
                    AssessmentId = c.AssessmentId,
                    CriteriaName = c.CriteriaName ?? string.Empty,
                    Weight       = c.Weight ?? 0
                }).ToList(),
            };

            // Map lịch bảo vệ theo thứ tự cho các lần bảo vệ (final + retake)
            if ((item.IsFinal || item.IsRetake) && scheduleQueue.Count > 0)
            {
                var ds = finalAttemptIndex < scheduleQueue.Count
                    ? scheduleQueue[finalAttemptIndex]
                    : scheduleQueue[^1];
                item.DefenseDate      = ds.DefenseDate;
                item.DefenseStartTime = ds.StartTime;
                item.DefenseEndTime   = ds.EndTime;
                item.RoomId           = ds.RoomId;
                item.RoomName         = ds.Room?.RoomName;
                item.RoomLocation     = ds.Location ?? ds.Room?.Building;
                item.DefenseStatus    = ds.Status;
                finalAttemptIndex++;
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
            Assessments        = items,
            TotalScore         = raw.FinalResult?.TotalScore,
            IsPassed           = raw.FinalResult?.IsPassed
        };
    }

    public async Task<bool> SaveGradesByCriteriaAsync(SaveGradesByCriteriaDto dto, int teacherId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(dto.AssessmentId);

            if (assessment == null)
                throw new Exception("Assessment not found");

            var criteriaDict = assessment.AssessmentCriteria.ToDictionary(c => c.CriteriaId, c => c.Weight ?? 0);

            // 1. Cập nhật Comment của Giáo viên vào Submission
            var submission = await _submissionRepository.GetByGroupAndAssessmentAsync(dto.GroupId, dto.AssessmentId);

            if (submission != null && !string.IsNullOrEmpty(dto.TeacherComment))
            {
                submission.TeacherComment = dto.TeacherComment;
                _submissionRepository.Update(submission);
            }

            // 2. Cập nhật Điểm tiêu chí và tính Tổng điểm đợt (AssessmentScore)
            foreach (var studentData in dto.StudentScores)
            {
                decimal totalAssessmentScore = 0;

                foreach (var (criteriaId, score) in studentData.CriteriaScores)
                {
                    // Lưu/Cập nhật CriteriaGrade (Bảng điểm cho từng tiêu chí)
                    var existingCriteriaGrade = await _criteriaGradeRepository.GetByUserAndCriteriaAsync(studentData.UserId, criteriaId);

                    if (existingCriteriaGrade != null)
                    {
                        existingCriteriaGrade.Score = score;
                        existingCriteriaGrade.TeacherId = teacherId;
                        _criteriaGradeRepository.Update(existingCriteriaGrade);
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
                        await _criteriaGradeRepository.AddAsync(newCriteriaGrade);
                    }

                    // Cộng dồn vào tổng điểm đợt (Nhân hệ số tiêu chí)
                    if (criteriaDict.TryGetValue(criteriaId, out var criteriaWeight))
                    {
                        totalAssessmentScore += score * (criteriaWeight / 100m);
                    }
                }

                // Lưu/Cập nhật AssessmentScore (Tổng điểm của đợt)
                var existingAssessmentScore = await _assessmentScoreRepository.GetByAssessmentAndUserAsync(dto.AssessmentId, studentData.UserId);
                decimal passThreshold = (assessment.IsFinal == true || assessment.IsRetake == true) ? 4 : 5;

                if (existingAssessmentScore != null)
                {
                    existingAssessmentScore.Score = totalAssessmentScore;
                    existingAssessmentScore.IsPassed = totalAssessmentScore >= passThreshold;
                    _assessmentScoreRepository.Update(existingAssessmentScore);
                }
                else
                {
                    var newScore = new AssessmentScore
                    {
                        AssessmentId = dto.AssessmentId,
                        UserId = studentData.UserId,
                        Score = totalAssessmentScore,
                        IsPassed = totalAssessmentScore >= passThreshold
                    };
                    await _assessmentScoreRepository.AddAsync(newScore);
                }
            }

            await _assessmentRepository.SaveChangesAsync();

            // 3. Tính lại Tổng Kết Môn (StudentFinalResult)
            var semesterId = assessment.SemesterId;
            var assessmentsInSemester = await _assessmentRepository.GetAssessmentsBySemesterAsync(semesterId, true);

            var studentIds = dto.StudentScores.Select(s => s.UserId).ToList();

            var allScoresForStudents = await _assessmentScoreRepository.GetByAssessmentsAndUsersAsync(
                assessmentsInSemester.Select(a => a.AssessmentId).ToList(), 
                studentIds);

            foreach (var studentId in studentIds)
            {
                decimal currentTotal = 0;
                bool failedFinal = false;
                bool finalExists = false;
                bool hasAllFinalScores = true;
                bool hasAnyFinalOrRetakeScore = false;

                // Group assessments by base original title to handle overrides
                var assessmentsByBaseTitle = assessmentsInSemester
                    .Where(a => a.IsRetake == false)
                    .ToList();

                foreach (var a in assessmentsByBaseTitle)
                {
                    var retakeAssessment = assessmentsInSemester.FirstOrDefault(ra => 
                        ra.IsRetake == true && 
                        a.Title != null && ra.Title != null && ra.Title.ToLower().Contains(a.Title.ToLower()) &&
                        ra.Title.ToLower().Contains("retake") &&
                        ra.SemesterId == a.SemesterId);

                    var origScoreEntry = allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == a.AssessmentId);
                    var retakeScoreEntry = retakeAssessment != null 
                        ? allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == retakeAssessment.AssessmentId) 
                        : null;

                    var effectiveScore = retakeScoreEntry?.Score ?? origScoreEntry?.Score ?? 0;
                    currentTotal += effectiveScore * (a.Weight ?? 0) / 100m;

                    if (a.IsFinal == true)
                    {
                        finalExists = true;
                        if (origScoreEntry == null && retakeScoreEntry == null) hasAllFinalScores = false;
                        if (origScoreEntry != null || retakeScoreEntry != null) hasAnyFinalOrRetakeScore = true;
                        
                        // A student fails the final requirement if their LATEST score (Retake >= Final) is < 4
                        if (effectiveScore < 4) failedFinal = true;
                    }
                }

                var finalResult = await _finalResultRepository.GetByUserAndSemesterAsync(studentId, semesterId);
                
                // Calculation visibility: Only record TotalScore if at least one Final-related score exists
                decimal? totalScoreToSaveView = hasAnyFinalOrRetakeScore ? currentTotal : (decimal?)null;
                bool? isPassedToSaveView = hasAnyFinalOrRetakeScore ? (currentTotal >= 5 && !failedFinal) : (bool?)null;

                if (finalResult != null)
                {
                    finalResult.TotalScore = totalScoreToSaveView;
                    finalResult.IsPassed = isPassedToSaveView;
                    _finalResultRepository.Update(finalResult);
                }
                else if (hasAnyFinalOrRetakeScore)
                {
                    finalResult = new StudentFinalResult
                    {
                        UserId = studentId,
                        SemesterId = semesterId,
                        TotalScore = totalScoreToSaveView,
                        IsPassed = isPassedToSaveView
                    };
                    await _finalResultRepository.AddAsync(finalResult);
                }
            }

            await _assessmentRepository.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("Error saving grades by criteria: " + ex.Message);
        }
    }

    public async Task<bool> SaveCouncilGradesAsync(SaveCouncilGradesDto dto, int teacherId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var assessment = await _assessmentRepository.GetAssessmentWithCriteriaAsync(dto.AssessmentId);

            if (assessment == null)
                throw new Exception("Assessment not found");

            var criteriaDict = assessment.AssessmentCriteria.ToDictionary(c => c.CriteriaId, c => c.Weight ?? 0);

            // 1. Lưu điểm của Giảng viên này vào CouncilCriteriaGrade
            foreach (var studentData in dto.StudentScores)
            {
                foreach (var (criteriaId, score) in studentData.CriteriaScores)
                {
                    var existingGrade = await _councilGradeRepository.GetGradeAsync(dto.CouncilId, dto.GroupId, studentData.UserId, teacherId, criteriaId);

                    if (existingGrade != null)
                    {
                        existingGrade.Score = score;
                        _councilGradeRepository.Update(existingGrade);
                    }
                    else
                    {
                        var newGrade = new CouncilCriteriaGrade
                        {
                            CouncilId = dto.CouncilId,
                            GroupId = dto.GroupId,
                            UserId = studentData.UserId,
                            TeacherId = teacherId,
                            CriteriaId = criteriaId,
                            Score = score
                        };
                        await _councilGradeRepository.AddAsync(newGrade);
                    }
                }
            }

            await _assessmentRepository.SaveChangesAsync(); // Using any repository's SaveChangesAsync is fine as they share the context

            // 2. Kiểm tra xem tất cả thành viên hội đồng đã chấm xong chưa
            var councilMemberIds = await _councilRepository.GetMemberUserIdsAsync(dto.CouncilId);
            var criteriaIds = criteriaDict.Keys.ToList();
            var teachersWhoGraded = await _councilGradeRepository.GetTeachersWhoGradedAsync(dto.CouncilId, dto.GroupId, criteriaIds);

            bool allMembersGraded = councilMemberIds.All(m => teachersWhoGraded.Contains(m));

            if (allMembersGraded)
            {
                // 3. Tính điểm trung bình và cập nhật AssessmentScore
                var studentIds = dto.StudentScores.Select(s => s.UserId).ToList();
                var allCouncilGrades = await _councilGradeRepository.GetGradesForGroupAsync(dto.CouncilId, dto.GroupId);

                foreach (var studentId in studentIds)
                {
                    decimal totalAverageAssessmentScore = 0;

                    foreach (var criteria in assessment.AssessmentCriteria)
                    {
                        var gradesForCriteria = allCouncilGrades
                            .Where(g => g.UserId == studentId && g.CriteriaId == criteria.CriteriaId)
                            .Select(g => g.Score ?? 0)
                            .ToList();

                        if (gradesForCriteria.Any())
                        {
                            decimal avgCriteriaScore = gradesForCriteria.Average();
                            totalAverageAssessmentScore += avgCriteriaScore * ((criteria.Weight ?? 0) / 100m);
                        }
                    }

                    var existingScore = await _assessmentScoreRepository.GetByAssessmentAndUserAsync(dto.AssessmentId, studentId);
                    decimal passThreshold = (assessment.IsFinal == true || assessment.IsRetake == true) ? 4 : 5;

                    if (existingScore != null)
                    {
                        existingScore.Score = totalAverageAssessmentScore;
                        existingScore.IsPassed = totalAverageAssessmentScore >= passThreshold;
                        _assessmentScoreRepository.Update(existingScore);
                    }
                    else
                    {
                        var newScore = new AssessmentScore
                        {
                            AssessmentId = dto.AssessmentId,
                            UserId = studentId,
                            Score = totalAverageAssessmentScore,
                            IsPassed = totalAverageAssessmentScore >= passThreshold
                        };
                        await _assessmentScoreRepository.AddAsync(newScore);
                    }
                }

                // 4. Cập nhật trạng thái DefenseSchedule
                var schedule = await _defenseScheduleRepository.GetWithDetailsAsync(dto.ScheduleId);
                if (schedule != null)
                {
                    schedule.Status = "COMPLETED";
                    _defenseScheduleRepository.Update(schedule);
                }

                await _assessmentRepository.SaveChangesAsync();

                // 5. Tính lại Tổng Kết Môn
                var assessmentsInSemester = await _assessmentRepository.GetAssessmentsBySemesterAsync(assessment.SemesterId, true);
                var assessmentIdsInSemester = assessmentsInSemester.Select(a => a.AssessmentId).ToList();

                var allScoresForStudents = await _assessmentScoreRepository.GetByAssessmentsAndUsersAsync(assessmentIdsInSemester, studentIds);

                foreach (var studentId in studentIds)
                {
                    decimal currentTotal = 0;
                    bool failedFinal = false;
                    bool finalExists = false;
                    bool hasAllFinalScores = true;
                    bool hasAnyFinalOrRetakeScore = false;

                    // Group assessments by base original title to handle overrides
                    var assessmentsByBaseTitle = assessmentsInSemester
                        .Where(a => a.IsRetake == false)
                        .ToList();

                    foreach (var a in assessmentsByBaseTitle)
                    {
                        var retakeAssessment = assessmentsInSemester.FirstOrDefault(ra => 
                            ra.IsRetake == true && 
                            a.Title != null && ra.Title != null && ra.Title.ToLower().Contains(a.Title.ToLower()) &&
                            ra.Title.ToLower().Contains("retake") &&
                            ra.SemesterId == a.SemesterId);

                        var origScoreEntry = allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == a.AssessmentId);
                        var retakeScoreEntry = retakeAssessment != null 
                            ? allScoresForStudents.FirstOrDefault(s => s.UserId == studentId && s.AssessmentId == retakeAssessment.AssessmentId) 
                            : null;

                        var effectiveScore = retakeScoreEntry?.Score ?? origScoreEntry?.Score ?? 0;
                        currentTotal += effectiveScore * (a.Weight ?? 0) / 100m;

                        if (a.IsFinal == true)
                        {
                            finalExists = true;
                            if (origScoreEntry == null && retakeScoreEntry == null) hasAllFinalScores = false;
                            if (origScoreEntry != null || retakeScoreEntry != null) hasAnyFinalOrRetakeScore = true;
                            
                            // A student fails the final requirement if their LATEST score (Retake >= Final) is < 4
                            if (effectiveScore < 4) failedFinal = true;
                        }
                    }

                    var finalResult = await _finalResultRepository.GetByUserAndSemesterAsync(studentId, assessment.SemesterId);
                    
                    // Calculation visibility: Only record TotalScore if at least one Final-related score exists
                    decimal? totalScoreToSaveView = hasAnyFinalOrRetakeScore ? currentTotal : (decimal?)null;
                    bool? isPassedToSaveView = hasAnyFinalOrRetakeScore ? (currentTotal >= 5 && !failedFinal) : (bool?)null;

                    if (finalResult != null)
                    {
                        finalResult.TotalScore = hasAnyFinalOrRetakeScore ? currentTotal : (decimal?)null;
                        finalResult.IsPassed = hasAnyFinalOrRetakeScore ? (currentTotal >= 5 && !failedFinal) : (bool?)null;
                        _finalResultRepository.Update(finalResult);
                    }
                    else if (hasAnyFinalOrRetakeScore)
                    {
                        var newFinalResult = new StudentFinalResult
                        {
                            UserId = studentId,
                            SemesterId = assessment.SemesterId,
                            TotalScore = totalScoreToSaveView,
                            IsPassed = isPassedToSaveView
                        };
                        await _finalResultRepository.AddAsync(newFinalResult);
                    }
                }
                await _assessmentRepository.SaveChangesAsync();
            }

            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("Error saving council grades: " + ex.Message);
        }
    }
    
    public async Task<List<CouncilCriteriaGradeDto>> GetCouncilGradesAsync(int councilId, int groupId, int teacherId)
    {
        var grades = await _councilGradeRepository.GetGradesForGroupAsync(councilId, groupId);
        return grades
            .Where(g => g.TeacherId == teacherId)
            .Select(g => new CouncilCriteriaGradeDto
            {
                UserId = g.UserId,
                CriteriaId = g.CriteriaId,
                Score = g.Score ?? 0
            })
            .ToList();
    }

    public async Task<List<int>> GetUsersPassedFinalAsync(int groupId)
    {
        var group = await _context.Groups.FindAsync(groupId);
        if (group == null) return new List<int>();

        var passedUserIds = await _context.AssessmentScores
            .Include(s => s.Assessment)
            .Where(s => (s.Assessment.IsFinal == true || s.Assessment.IsRetake == true) && s.IsPassed == true && s.Assessment.SemesterId == group.SemesterId)
            .Join(_context.GroupMembers.Where(gm => gm.GroupId == groupId),
                  score => score.UserId,
                  member => member.UserId,
                  (score, member) => score.UserId)
            .Distinct()
            .ToListAsync();

        return passedUserIds;
    }
}
