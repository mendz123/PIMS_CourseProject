using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class PimsDbContext : DbContext
{
    public PimsDbContext()
    {
    }

    public PimsDbContext(DbContextOptions<PimsDbContext> options)
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

    public virtual DbSet<DefenseSchedule> DefenseSchedules { get; set; }

    public virtual DbSet<Grader> Graders { get; set; }

    public virtual DbSet<Group> Groups { get; set; }

    public virtual DbSet<GroupMember> GroupMembers { get; set; }

    public virtual DbSet<GroupStatus> GroupStatuses { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectStatus> ProjectStatuses { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Semester> Semesters { get; set; }

    public virtual DbSet<StudentCourseResult> StudentCourseResults { get; set; }

    public virtual DbSet<SubmissionFile> SubmissionFiles { get; set; }

    public virtual DbSet<TeacherAssessment> TeacherAssessments { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserStatus> UserStatuses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer("Server=pims-db.cb26g0068dod.ap-southeast-1.rds.amazonaws.com,1433;Database=PIMS_Project;User Id=admin;Password=khaidz12345;TrustServerCertificate=True;");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assessment>(entity =>
        {
            entity.HasKey(e => e.AssessmentId).HasName("PK__Assessme__3D2BF81E9BCA0F4C");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DueDate).HasColumnType("datetime");
            entity.Property(e => e.IsFinal).HasDefaultValue(false);
            entity.Property(e => e.MinScoreToPass).HasDefaultValue(0.0);
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Class).WithMany(p => p.Assessments)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__Assessmen__Class__571DF1D5");
        });

        modelBuilder.Entity<AssessmentCriterion>(entity =>
        {
            entity.HasKey(e => e.CriteriaId).HasName("PK__Assessme__FE6ADBCDC69F72BC");

            entity.Property(e => e.CriteriaName).HasMaxLength(255);
            entity.Property(e => e.MaxScore).HasDefaultValue(10.0);
            entity.Property(e => e.Weight).HasDefaultValue(1.0);

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentCriteria)
                .HasForeignKey(d => d.AssessmentId)
                .HasConstraintName("FK__Assessmen__Asses__5CD6CB2B");
        });

        modelBuilder.Entity<AssessmentScore>(entity =>
        {
            entity.HasKey(e => e.ScoreId).HasName("PK__Assessme__7DD229D1FB206AFF");

            entity.HasIndex(e => new { e.StudentId, e.AssessmentId, e.CouncilId }, "UC_Student_Assessment").IsUnique();

            entity.Property(e => e.GradedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentScores)
                .HasForeignKey(d => d.AssessmentId)
                .HasConstraintName("FK__Assessmen__Asses__03F0984C");

            entity.HasOne(d => d.Council).WithMany(p => p.AssessmentScores)
                .HasForeignKey(d => d.CouncilId)
                .HasConstraintName("FK__Assessmen__Counc__06CD04F7");

            entity.HasOne(d => d.Group).WithMany(p => p.AssessmentScores)
                .HasForeignKey(d => d.GroupId)
                .HasConstraintName("FK__Assessmen__Group__05D8E0BE");

            entity.HasOne(d => d.Student).WithMany(p => p.AssessmentScores)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__Assessmen__Stude__04E4BC85");
        });

        modelBuilder.Entity<AssessmentSubmission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId).HasName("PK__Assessme__449EE125FD60ECF8");

            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentSubmissions)
                .HasForeignKey(d => d.AssessmentId)
                .HasConstraintName("FK__Assessmen__Asses__6C190EBB");

            entity.HasOne(d => d.Group).WithMany(p => p.AssessmentSubmissions)
                .HasForeignKey(d => d.GroupId)
                .HasConstraintName("FK__Assessmen__Group__6D0D32F4");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.AssessmentSubmissions)
                .HasForeignKey(d => d.UploadedBy)
                .HasConstraintName("FK__Assessmen__Uploa__6E01572D");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Classes__CB1927C0641262A6");

            entity.HasIndex(e => e.ClassCode, "UQ__Classes__2ECD4A55A8E7D5AF").IsUnique();

            entity.Property(e => e.ClassCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ClassName).HasMaxLength(255);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.GroupDeadline).HasColumnType("datetime");
            entity.Property(e => e.MaxGroupSize).HasDefaultValue(1);
            entity.Property(e => e.MinGroupSize).HasDefaultValue(1);

            entity.HasOne(d => d.Semester).WithMany(p => p.Classes)
                .HasForeignKey(d => d.SemesterId)
                .HasConstraintName("FK__Classes__Semeste__3B75D760");

            entity.HasOne(d => d.Status).WithMany(p => p.Classes)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__Classes__StatusI__3F466844");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Classes)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__Classes__Teacher__3C69FB99");
        });

        modelBuilder.Entity<ClassStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ClassSta__C8EE20632F4A82AE");

            entity.ToTable("ClassStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasKey(e => e.ClassStudentId).HasName("PK__ClassStu__B8147819E3D9DF8A");

            entity.Property(e => e.StudentEmail)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Class).WithMany(p => p.ClassStudents)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__ClassStud__Class__4316F928");

            entity.HasOne(d => d.Status).WithMany(p => p.ClassStudents)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__ClassStud__Statu__44FF419A");

            entity.HasOne(d => d.Student).WithMany(p => p.ClassStudents)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__ClassStud__Stude__440B1D61");
        });

        modelBuilder.Entity<ClassStudentStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ClassStu__C8EE2063330A2146");

            entity.ToTable("ClassStudentStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<Council>(entity =>
        {
            entity.HasKey(e => e.CouncilId).HasName("PK__Councils__1BBAA5C13C3157EC");

            entity.Property(e => e.CouncilName).HasMaxLength(100);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.Round).HasDefaultValue(1);

            entity.HasOne(d => d.Assessment).WithMany(p => p.Councils)
                .HasForeignKey(d => d.AssessmentId)
                .HasConstraintName("FK__Councils__Assess__619B8048");

            entity.HasOne(d => d.Status).WithMany(p => p.Councils)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__Councils__Status__6383C8BA");
        });

        modelBuilder.Entity<CouncilStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__CouncilS__C8EE206374BAD9B5");

            entity.ToTable("CouncilStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<CriteriaGrade>(entity =>
        {
            entity.HasKey(e => e.GradeId).HasName("PK__Criteria__54F87A57F45CBC05");

            entity.HasIndex(e => new { e.GraderId, e.StudentId, e.CriteriaId }, "UC_Grader_Student_Criteria").IsUnique();

            entity.Property(e => e.GradedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Criteria).WithMany(p => p.CriteriaGrades)
                .HasForeignKey(d => d.CriteriaId)
                .HasConstraintName("FK__CriteriaG__Crite__7E37BEF6");

            entity.HasOne(d => d.Grader).WithMany(p => p.CriteriaGrades)
                .HasForeignKey(d => d.GraderId)
                .HasConstraintName("FK__CriteriaG__Grade__7C4F7684");

            entity.HasOne(d => d.Student).WithMany(p => p.CriteriaGrades)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__CriteriaG__Stude__7D439ABD");
        });

        modelBuilder.Entity<DefenseSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__DefenseS__9C8A5B49B70F2DED");

            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(d => d.Council).WithMany(p => p.DefenseSchedules)
                .HasForeignKey(d => d.CouncilId)
                .HasConstraintName("FK__DefenseSc__Counc__2739D489");

            entity.HasOne(d => d.Group).WithMany(p => p.DefenseSchedules)
                .HasForeignKey(d => d.GroupId)
                .HasConstraintName("FK__DefenseSc__Group__282DF8C2");
        });

        modelBuilder.Entity<Grader>(entity =>
        {
            entity.HasKey(e => e.GraderId).HasName("PK__Graders__9DDC5656C9FFCB1F");

            entity.HasOne(d => d.Assessment).WithMany(p => p.Graders)
                .HasForeignKey(d => d.AssessmentId)
                .HasConstraintName("FK__Graders__Assessm__6754599E");

            entity.HasOne(d => d.Council).WithMany(p => p.Graders)
                .HasForeignKey(d => d.CouncilId)
                .HasConstraintName("FK__Graders__Council__693CA210");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Graders)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__Graders__Teacher__68487DD7");
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.GroupId).HasName("PK__Groups__149AF36AEAABF7A7");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.GroupName).HasMaxLength(255);

            entity.HasOne(d => d.Class).WithMany(p => p.Groups)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__Groups__ClassId__47DBAE45");

            entity.HasOne(d => d.Leader).WithMany(p => p.Groups)
                .HasForeignKey(d => d.LeaderId)
                .HasConstraintName("FK__Groups__LeaderId__48CFD27E");

            entity.HasOne(d => d.Status).WithMany(p => p.Groups)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__Groups__StatusId__49C3F6B7");
        });

        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(e => e.GroupMemberId).HasName("PK__GroupMem__34481292E34BB5D6");

            entity.Property(e => e.JoinedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.LeftAt).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("ACTIVE");

            entity.HasOne(d => d.Group).WithMany(p => p.GroupMembers)
                .HasForeignKey(d => d.GroupId)
                .HasConstraintName("FK__GroupMemb__Group__4D94879B");

            entity.HasOne(d => d.Student).WithMany(p => p.GroupMembers)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__GroupMemb__Stude__4E88ABD4");
        });

        modelBuilder.Entity<GroupStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__GroupSta__C8EE2063B130FE64");

            entity.ToTable("GroupStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E125F828258");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Notificat__UserI__0F624AF8");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("PK__Projects__761ABEF0F1049B07");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Group).WithMany(p => p.Projects)
                .HasForeignKey(d => d.GroupId)
                .HasConstraintName("FK__Projects__GroupI__52593CB8");

            entity.HasOne(d => d.Status).WithMany(p => p.Projects)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__Projects__Status__534D60F1");
        });

        modelBuilder.Entity<ProjectStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ProjectS__C8EE20635FBCF8C4");

            entity.ToTable("ProjectStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RefreshT__3214EC07452472AF");

            entity.HasIndex(e => e.Token, "IX_RefreshTokens_Token");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ExpiresAt).HasColumnType("datetime");
            entity.Property(e => e.RevokedAt).HasColumnType("datetime");
            entity.Property(e => e.Token).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RefreshTo__UserI__2180FB33");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A01D83829");

            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasKey(e => e.SemesterId).HasName("PK__Semester__043301DD7BD5F7B2");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.SemesterName).HasMaxLength(50);
        });

        modelBuilder.Entity<StudentCourseResult>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__StudentC__97690208A2D6AD6D");

            entity.Property(e => e.CourseStatus).HasMaxLength(20);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Class).WithMany(p => p.StudentCourseResults)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__StudentCo__Class__0B91BA14");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentCourseResults)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__StudentCo__Stude__0A9D95DB");
        });

        modelBuilder.Entity<SubmissionFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__Submissi__6F0F98BF9A4B5A58");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.FileType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.FileUrl)
                .HasMaxLength(1000)
                .IsUnicode(false);

            entity.HasOne(d => d.Submission).WithMany(p => p.SubmissionFiles)
                .HasForeignKey(d => d.SubmissionId)
                .HasConstraintName("FK__Submissio__Submi__71D1E811");
        });

        modelBuilder.Entity<TeacherAssessment>(entity =>
        {
            entity.HasKey(e => e.TeacherAssessmentId).HasName("PK__TeacherA__CCB01FE9C22BF311");

            entity.HasIndex(e => new { e.GraderId, e.StudentId }, "UC_Grader_Student").IsUnique();

            entity.Property(e => e.GradedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Grader).WithMany(p => p.TeacherAssessments)
                .HasForeignKey(d => d.GraderId)
                .HasConstraintName("FK__TeacherAs__Grade__76969D2E");

            entity.HasOne(d => d.Student).WithMany(p => p.TeacherAssessments)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__TeacherAs__Stude__778AC167");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4CF8712CB5");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534F7334DFE").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.EmailVerificationToken).HasMaxLength(255);
            entity.Property(e => e.EmailVerificationTokenExpiry).HasColumnType("datetime");
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__Users__RoleId__35BCFE0A");

            entity.HasOne(d => d.Status).WithMany(p => p.Users)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__Users__StatusId__36B12243");
        });

        modelBuilder.Entity<UserStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__UserStat__C8EE2063AD1095E3");

            entity.ToTable("UserStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
