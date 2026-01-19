using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class PimsProjectContext : DbContext
{
    public PimsProjectContext()
    {
    }

    public PimsProjectContext(DbContextOptions<PimsProjectContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Assessment> Assessments { get; set; }

    public virtual DbSet<AssessmentCriterion> AssessmentCriteria { get; set; }

    public virtual DbSet<AssessmentScore> AssessmentScores { get; set; }

    public virtual DbSet<AssessmentSubmission> AssessmentSubmissions { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<ClassStatus> ClassStatuses { get; set; }

    public virtual DbSet<ClassStudent> ClassStudents { get; set; }

    public virtual DbSet<ClassStudentStatus> ClassStudentStatuses { get; set; }

    public virtual DbSet<Council> Councils { get; set; }

    public virtual DbSet<CouncilStatus> CouncilStatuses { get; set; }

    public virtual DbSet<CriteriaGrade> CriteriaGrades { get; set; }

    public virtual DbSet<Grader> Graders { get; set; }

    public virtual DbSet<Group> Groups { get; set; }

    public virtual DbSet<GroupMember> GroupMembers { get; set; }

    public virtual DbSet<GroupStatus> GroupStatuses { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectStatus> ProjectStatuses { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Semester> Semesters { get; set; }

    public virtual DbSet<StudentCourseResult> StudentCourseResults { get; set; }

    public virtual DbSet<SubmissionFile> SubmissionFiles { get; set; }

    public virtual DbSet<TeacherAssessment> TeacherAssessments { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserStatus> UserStatuses { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string is configured in Program.cs from appsettings.json
        // This method is intentionally left empty for security
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assessment>(entity =>
        {
            entity.HasKey(e => e.AssessmentId).HasName("PK__Assessme__3D2BF81E9BCA0F4C");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsFinal).HasDefaultValue(false);
            entity.Property(e => e.MinScoreToPass).HasDefaultValue(0.0);

            entity.HasOne(d => d.Class).WithMany(p => p.Assessments).HasConstraintName("FK__Assessmen__Class__571DF1D5");
        });

        modelBuilder.Entity<AssessmentCriterion>(entity =>
        {
            entity.HasKey(e => e.CriteriaId).HasName("PK__Assessme__FE6ADBCDC69F72BC");

            entity.Property(e => e.MaxScore).HasDefaultValue(10.0);
            entity.Property(e => e.Weight).HasDefaultValue(1.0);

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentCriteria).HasConstraintName("FK__Assessmen__Asses__5CD6CB2B");
        });

        modelBuilder.Entity<AssessmentScore>(entity =>
        {
            entity.HasKey(e => e.ScoreId).HasName("PK__Assessme__7DD229D1FB206AFF");

            entity.Property(e => e.GradedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentScores).HasConstraintName("FK__Assessmen__Asses__03F0984C");

            entity.HasOne(d => d.Council).WithMany(p => p.AssessmentScores).HasConstraintName("FK__Assessmen__Counc__06CD04F7");

            entity.HasOne(d => d.Group).WithMany(p => p.AssessmentScores).HasConstraintName("FK__Assessmen__Group__05D8E0BE");

            entity.HasOne(d => d.Student).WithMany(p => p.AssessmentScores).HasConstraintName("FK__Assessmen__Stude__04E4BC85");
        });

        modelBuilder.Entity<AssessmentSubmission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId).HasName("PK__Assessme__449EE125FD60ECF8");

            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentSubmissions).HasConstraintName("FK__Assessmen__Asses__6C190EBB");

            entity.HasOne(d => d.Group).WithMany(p => p.AssessmentSubmissions).HasConstraintName("FK__Assessmen__Group__6D0D32F4");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.AssessmentSubmissions).HasConstraintName("FK__Assessmen__Uploa__6E01572D");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Classes__CB1927C0641262A6");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.MaxGroupSize).HasDefaultValue(1);
            entity.Property(e => e.MinGroupSize).HasDefaultValue(1);

            entity.HasOne(d => d.Semester).WithMany(p => p.Classes).HasConstraintName("FK__Classes__Semeste__3B75D760");

            entity.HasOne(d => d.Status).WithMany(p => p.Classes).HasConstraintName("FK__Classes__StatusI__3F466844");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Classes).HasConstraintName("FK__Classes__Teacher__3C69FB99");
        });

        modelBuilder.Entity<ClassStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ClassSta__C8EE20632F4A82AE");
            entity.ToTable("ClassStatus");
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasKey(e => e.ClassStudentId).HasName("PK__ClassStu__B8147819E3D9DF8A");

            entity.HasOne(d => d.Class).WithMany(p => p.ClassStudents).HasConstraintName("FK__ClassStud__Class__4316F928");

            entity.HasOne(d => d.Status).WithMany(p => p.ClassStudents).HasConstraintName("FK__ClassStud__Statu__44FF419A");

            entity.HasOne(d => d.Student).WithMany(p => p.ClassStudents).HasConstraintName("FK__ClassStud__Stude__440B1D61");
        });

        modelBuilder.Entity<ClassStudentStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ClassStu__C8EE2063330A2146");
            entity.ToTable("ClassStudentStatus");
        });

        modelBuilder.Entity<Council>(entity =>
        {
            entity.HasKey(e => e.CouncilId).HasName("PK__Councils__1BBAA5C13C3157EC");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Round).HasDefaultValue(1);

            entity.HasOne(d => d.Assessment).WithMany(p => p.Councils).HasConstraintName("FK__Councils__Assess__619B8048");

            entity.HasOne(d => d.Status).WithMany(p => p.Councils).HasConstraintName("FK__Councils__Status__6383C8BA");
        });

        modelBuilder.Entity<CouncilStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__CouncilS__C8EE206374BAD9B5");
            entity.ToTable("CouncilStatus");
        });

        modelBuilder.Entity<CriteriaGrade>(entity =>
        {
            entity.HasKey(e => e.GradeId).HasName("PK__Criteria__54F87A57F45CBC05");

            entity.Property(e => e.GradedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Criteria).WithMany(p => p.CriteriaGrades).HasConstraintName("FK__CriteriaG__Crite__7E37BEF6");

            entity.HasOne(d => d.Grader).WithMany(p => p.CriteriaGrades).HasConstraintName("FK__CriteriaG__Grade__7C4F7684");

            entity.HasOne(d => d.Student).WithMany(p => p.CriteriaGrades).HasConstraintName("FK__CriteriaG__Stude__7D439ABD");
        });

        modelBuilder.Entity<Grader>(entity =>
        {
            entity.HasKey(e => e.GraderId).HasName("PK__Graders__9DDC5656C9FFCB1F");

            entity.HasOne(d => d.Assessment).WithMany(p => p.Graders).HasConstraintName("FK__Graders__Assessm__6754599E");

            entity.HasOne(d => d.Council).WithMany(p => p.Graders).HasConstraintName("FK__Graders__Council__693CA210");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Graders).HasConstraintName("FK__Graders__Teacher__68487DD7");
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.GroupId).HasName("PK__Groups__149AF36AEAABF7A7");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Class).WithMany(p => p.Groups).HasConstraintName("FK__Groups__ClassId__47DBAE45");

            entity.HasOne(d => d.Leader).WithMany(p => p.Groups).HasConstraintName("FK__Groups__LeaderId__48CFD27E");

            entity.HasOne(d => d.Status).WithMany(p => p.Groups).HasConstraintName("FK__Groups__StatusId__49C3F6B7");
        });

        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(e => e.GroupMemberId).HasName("PK__GroupMem__34481292E34BB5D6");

            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Group).WithMany(p => p.GroupMembers).HasConstraintName("FK__GroupMemb__Group__4D94879B");

            entity.HasOne(d => d.Student).WithMany(p => p.GroupMembers).HasConstraintName("FK__GroupMemb__Stude__4E88ABD4");
        });

        modelBuilder.Entity<GroupStatus>(entity =>
        {
            entity.ToTable("GroupStatus");
            entity.HasKey(e => e.StatusId).HasName("PK__GroupSta__C8EE2063B130FE64");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E125F828258");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications).HasConstraintName("FK__Notificat__UserI__0F624AF8");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("PK__Projects__761ABEF0F1049B07");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Group).WithMany(p => p.Projects).HasConstraintName("FK__Projects__GroupI__52593CB8");

            entity.HasOne(d => d.Status).WithMany(p => p.Projects).HasConstraintName("FK__Projects__Status__534D60F1");
        });

        modelBuilder.Entity<ProjectStatus>(entity =>
        {            entity.ToTable("ProjectStatus");            entity.HasKey(e => e.StatusId).HasName("PK__ProjectS__C8EE20635FBCF8C4");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A01D83829");
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasKey(e => e.SemesterId).HasName("PK__Semester__043301DD7BD5F7B2");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<StudentCourseResult>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__StudentC__97690208A2D6AD6D");

            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Class).WithMany(p => p.StudentCourseResults).HasConstraintName("FK__StudentCo__Class__0B91BA14");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentCourseResults).HasConstraintName("FK__StudentCo__Stude__0A9D95DB");
        });

        modelBuilder.Entity<SubmissionFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__Submissi__6F0F98BF9A4B5A58");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Submission).WithMany(p => p.SubmissionFiles).HasConstraintName("FK__Submissio__Submi__71D1E811");
        });

        modelBuilder.Entity<TeacherAssessment>(entity =>
        {
            entity.HasKey(e => e.TeacherAssessmentId).HasName("PK__TeacherA__CCB01FE9C22BF311");

            entity.Property(e => e.GradedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Grader).WithMany(p => p.TeacherAssessments).HasConstraintName("FK__TeacherAs__Grade__76969D2E");

            entity.HasOne(d => d.Student).WithMany(p => p.TeacherAssessments).HasConstraintName("FK__TeacherAs__Stude__778AC167");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4CF8712CB5");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.Users).HasConstraintName("FK__Users__RoleId__35BCFE0A");

            entity.HasOne(d => d.Status).WithMany(p => p.Users).HasConstraintName("FK__Users__StatusId__36B12243");
        });

        modelBuilder.Entity<UserStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__UserStat__C8EE2063AD1095E3");
            entity.ToTable("UserStatus"); // Map to the correct table name
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
