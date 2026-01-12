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

    public virtual DbSet<AssessmentScore> AssessmentScores { get; set; }

    public virtual DbSet<AssessmentSubmission> AssessmentSubmissions { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<ClassStatus> ClassStatuses { get; set; }

    public virtual DbSet<ClassStudent> ClassStudents { get; set; }

    public virtual DbSet<ClassStudentStatus> ClassStudentStatuses { get; set; }

    public virtual DbSet<Group> Groups { get; set; }

    public virtual DbSet<GroupMember> GroupMembers { get; set; }

    public virtual DbSet<GroupStatus> GroupStatuses { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectStatus> ProjectStatuses { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Semester> Semesters { get; set; }

    public virtual DbSet<SubmissionFile> SubmissionFiles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserStatus> UserStatuses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost;Database=PIMS_Project;User Id=sa;Password=123456789;Encrypt=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assessment>(entity =>
        {
            entity.HasKey(e => e.AssessmentId).HasName("PK__Assessme__3D2BF81EC9343F2C");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.MaxScore).HasDefaultValue(10.0);

            entity.HasOne(d => d.Class).WithMany(p => p.Assessments).HasConstraintName("FK__Assessmen__Class__68487DD7");
        });

        modelBuilder.Entity<AssessmentScore>(entity =>
        {
            entity.HasKey(e => e.ScoreId).HasName("PK__Assessme__7DD229D1F794F45F");

            entity.Property(e => e.GradedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentScores).HasConstraintName("FK__Assessmen__Asses__778AC167");

            entity.HasOne(d => d.GradedByNavigation).WithMany(p => p.AssessmentScoreGradedByNavigations).HasConstraintName("FK__Assessmen__Grade__7A672E12");

            entity.HasOne(d => d.Group).WithMany(p => p.AssessmentScores).HasConstraintName("FK__Assessmen__Group__797309D9");

            entity.HasOne(d => d.Student).WithMany(p => p.AssessmentScoreStudents).HasConstraintName("FK__Assessmen__Stude__787EE5A0");
        });

        modelBuilder.Entity<AssessmentSubmission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId).HasName("PK__Assessme__449EE1253AEEE47F");

            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentSubmissions).HasConstraintName("FK__Assessmen__Asses__6D0D32F4");

            entity.HasOne(d => d.Group).WithMany(p => p.AssessmentSubmissions).HasConstraintName("FK__Assessmen__Group__6E01572D");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.AssessmentSubmissions).HasConstraintName("FK__Assessmen__Uploa__6EF57B66");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Classes__CB1927C0015F91FC");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.MaxGroupSize).HasDefaultValue(1);
            entity.Property(e => e.MinGroupSize).HasDefaultValue(1);

            entity.HasOne(d => d.Semester).WithMany(p => p.Classes).HasConstraintName("FK__Classes__Semeste__4CA06362");

            entity.HasOne(d => d.Status).WithMany(p => p.Classes).HasConstraintName("FK__Classes__StatusI__5070F446");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Classes).HasConstraintName("FK__Classes__Teacher__4D94879B");
        });

        modelBuilder.Entity<ClassStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ClassSta__C8EE2063C183AE0A");
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasKey(e => e.ClassStudentId).HasName("PK__ClassStu__B8147819B5B1E5F2");

            entity.HasOne(d => d.Class).WithMany(p => p.ClassStudents).HasConstraintName("FK__ClassStud__Class__5441852A");

            entity.HasOne(d => d.Status).WithMany(p => p.ClassStudents).HasConstraintName("FK__ClassStud__Statu__5629CD9C");

            entity.HasOne(d => d.Student).WithMany(p => p.ClassStudents).HasConstraintName("FK__ClassStud__Stude__5535A963");
        });

        modelBuilder.Entity<ClassStudentStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ClassStu__C8EE20634E25EDFB");
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.GroupId).HasName("PK__Groups__149AF36AD4134B04");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Class).WithMany(p => p.Groups).HasConstraintName("FK__Groups__ClassId__59063A47");

            entity.HasOne(d => d.Leader).WithMany(p => p.Groups).HasConstraintName("FK__Groups__LeaderId__59FA5E80");

            entity.HasOne(d => d.Status).WithMany(p => p.Groups).HasConstraintName("FK__Groups__StatusId__5AEE82B9");
        });

        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(e => e.GroupMemberId).HasName("PK__GroupMem__3448129285E5482F");

            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Group).WithMany(p => p.GroupMembers).HasConstraintName("FK__GroupMemb__Group__5EBF139D");

            entity.HasOne(d => d.Student).WithMany(p => p.GroupMembers).HasConstraintName("FK__GroupMemb__Stude__5FB337D6");
        });

        modelBuilder.Entity<GroupStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__GroupSta__C8EE20633468AC2E");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E12611B15DE");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications).HasConstraintName("FK__Notificat__UserI__7E37BEF6");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("PK__Projects__761ABEF0443004AB");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Group).WithMany(p => p.Projects).HasConstraintName("FK__Projects__GroupI__6383C8BA");

            entity.HasOne(d => d.Status).WithMany(p => p.Projects).HasConstraintName("FK__Projects__Status__6477ECF3");
        });

        modelBuilder.Entity<ProjectStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ProjectS__C8EE20633DBB1376");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A2BCF02FF");
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasKey(e => e.SemesterId).HasName("PK__Semester__043301DD0ECBDEEB");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<SubmissionFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__Submissi__6F0F98BF067E005B");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Submission).WithMany(p => p.SubmissionFiles).HasConstraintName("FK__Submissio__Submi__72C60C4A");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C9D740A61");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.Users).HasConstraintName("FK__Users__RoleId__46E78A0C");

            entity.HasOne(d => d.Status).WithMany(p => p.Users).HasConstraintName("FK__Users__StatusId__47DBAE45");
        });

        modelBuilder.Entity<UserStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__UserStat__C8EE2063F68BC6F8");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
