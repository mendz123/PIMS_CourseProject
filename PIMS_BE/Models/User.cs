using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

[Index("Email", Name = "UQ__Users__A9D10534F7334DFE", IsUnique = true)]
public partial class User
{
    [Key]
    public int UserId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [StringLength(255)]
    [Unicode(false)]
    public string PasswordHash { get; set; } = null!;

    [StringLength(255)]
    public string? FullName { get; set; }

    public int? RoleId { get; set; }

    public int? StatusId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Student")]
    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    [InverseProperty("UploadedByNavigation")]
    public virtual ICollection<AssessmentSubmission> AssessmentSubmissions { get; set; } = new List<AssessmentSubmission>();

    [InverseProperty("Student")]
    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    [InverseProperty("Teacher")]
    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    [InverseProperty("Student")]
    public virtual ICollection<CriteriaGrade> CriteriaGrades { get; set; } = new List<CriteriaGrade>();

    [InverseProperty("Teacher")]
    public virtual ICollection<Grader> Graders { get; set; } = new List<Grader>();

    [InverseProperty("Student")]
    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    [InverseProperty("Leader")]
    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();

    [InverseProperty("User")]
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    [ForeignKey("RoleId")]
    [InverseProperty("Users")]
    public virtual Role? Role { get; set; }

    [ForeignKey("StatusId")]
    [InverseProperty("Users")]
    public virtual UserStatus? Status { get; set; }

    [InverseProperty("Student")]
    public virtual ICollection<StudentCourseResult> StudentCourseResults { get; set; } = new List<StudentCourseResult>();

    [InverseProperty("Student")]
    public virtual ICollection<TeacherAssessment> TeacherAssessments { get; set; } = new List<TeacherAssessment>();
}
