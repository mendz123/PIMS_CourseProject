using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string? FullName { get; set; }

    public int RoleId { get; set; }

    public int StatusId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Token for email verification (null if already verified)
    /// </summary>
    public string? EmailVerificationToken { get; set; }

    /// <summary>
    /// Expiration time for the verification token
    /// </summary>
    public DateTime? EmailVerificationTokenExpiresAt { get; set; }

    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    public virtual ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();

    public virtual ICollection<CouncilCriteriaGrade> CouncilCriteriaGradeTeachers { get; set; } = new List<CouncilCriteriaGrade>();

    public virtual ICollection<CouncilCriteriaGrade> CouncilCriteriaGradeUsers { get; set; } = new List<CouncilCriteriaGrade>();

    public virtual ICollection<CouncilMember> CouncilMembers { get; set; } = new List<CouncilMember>();

    public virtual ICollection<CriteriaGrade> CriteriaGradeTeachers { get; set; } = new List<CriteriaGrade>();

    public virtual ICollection<CriteriaGrade> CriteriaGradeUsers { get; set; } = new List<CriteriaGrade>();

    public virtual ICollection<Group> GroupLeaders { get; set; } = new List<Group>();

    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    public virtual ICollection<Group> GroupMentors { get; set; } = new List<Group>();

    public virtual ICollection<MentorRequest> MentorRequests { get; set; } = new List<MentorRequest>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual Role Role { get; set; } = null!;

    public virtual UserStatus Status { get; set; } = null!;

    public virtual ICollection<StudentFinalResult> StudentFinalResults { get; set; } = new List<StudentFinalResult>();
}
