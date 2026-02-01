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

    public virtual DbSet<Council> Councils { get; set; }

    public virtual DbSet<CouncilCriteriaGrade> CouncilCriteriaGrades { get; set; }

    public virtual DbSet<CouncilMember> CouncilMembers { get; set; }

    public virtual DbSet<CriteriaGrade> CriteriaGrades { get; set; }

    public virtual DbSet<DefenseSchedule> DefenseSchedules { get; set; }

    public virtual DbSet<Group> Groups { get; set; }

    public virtual DbSet<GroupMember> GroupMembers { get; set; }

    public virtual DbSet<GroupMemberStatus> GroupMemberStatuses { get; set; }

    public virtual DbSet<GroupStatus> GroupStatuses { get; set; }

    public virtual DbSet<MentorRequest> MentorRequests { get; set; }

    public virtual DbSet<MentorRequestStatus> MentorRequestStatuses { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectStatus> ProjectStatuses { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Semester> Semesters { get; set; }

    public virtual DbSet<StudentFinalResult> StudentFinalResults { get; set; }

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<UserStatus> UserStatuses { get; set; }
    public virtual DbSet<PasswordResetOtp> PasswordResetOtps { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // Connection string is configured through dependency injection
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assessment>(entity =>
        {
            entity.HasKey(e => e.AssessmentId).HasName("PK__Assessme__3D2BF81E93898FB3");

            entity.HasIndex(e => new { e.SemesterId, e.Title }, "UQ_Assessment_Semester").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsFinal).HasDefaultValue(false);
            entity.Property(e => e.IsLocked).HasDefaultValue(false);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Weight).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Assessments)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Assessment_Creator");

            entity.HasOne(d => d.Semester).WithMany(p => p.Assessments)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Assessment_Semester");
        });

        modelBuilder.Entity<AssessmentCriterion>(entity =>
        {
            entity.HasKey(e => e.CriteriaId).HasName("PK__Assessme__FE6ADBCD67D1F7A9");

            entity.HasIndex(e => new { e.AssessmentId, e.CriteriaName }, "UQ_Assessment_Criteria").IsUnique();

            entity.Property(e => e.CriteriaName).HasMaxLength(255);
            entity.Property(e => e.Weight).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentCriteria)
                .HasForeignKey(d => d.AssessmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AC_Assessment");
        });

        modelBuilder.Entity<AssessmentScore>(entity =>
        {
            entity.HasKey(e => e.ScoreId).HasName("PK__Assessme__7DD229D109426F44");

            entity.HasIndex(e => new { e.AssessmentId, e.UserId }, "UQ_Assessment_User").IsUnique();

            entity.Property(e => e.Score).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.Assessment).WithMany(p => p.AssessmentScores)
                .HasForeignKey(d => d.AssessmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AS_Assessment");

            entity.HasOne(d => d.User).WithMany(p => p.AssessmentScores)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AS_User");
        });

        modelBuilder.Entity<Council>(entity =>
        {
            entity.HasKey(e => e.CouncilId).HasName("PK__Councils__1BBAA5C1103DE038");

            entity.Property(e => e.CouncilName).HasMaxLength(100);

            entity.HasOne(d => d.Semester).WithMany(p => p.Councils)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Council_Semester");
        });

        modelBuilder.Entity<CouncilCriteriaGrade>(entity =>
        {
            entity.HasKey(e => e.GradeId).HasName("PK__CouncilC__54F87A57D01930EF");

            entity.HasIndex(e => new { e.CouncilId, e.GroupId, e.UserId, e.TeacherId, e.CriteriaId }, "UQ_Council_Grade").IsUnique();

            entity.Property(e => e.Score).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.Council).WithMany(p => p.CouncilCriteriaGrades)
                .HasForeignKey(d => d.CouncilId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CCG_Council");

            entity.HasOne(d => d.Criteria).WithMany(p => p.CouncilCriteriaGrades)
                .HasForeignKey(d => d.CriteriaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CCG_Criteria");

            entity.HasOne(d => d.Group).WithMany(p => p.CouncilCriteriaGrades)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CCG_Group");

            entity.HasOne(d => d.Teacher).WithMany(p => p.CouncilCriteriaGradeTeachers)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CCG_Teacher");

            entity.HasOne(d => d.User).WithMany(p => p.CouncilCriteriaGradeUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CCG_User");
        });

        modelBuilder.Entity<CouncilMember>(entity =>
        {
            entity.HasKey(e => e.CouncilMemberId).HasName("PK__CouncilM__457943C1587454EE");

            entity.HasIndex(e => new { e.CouncilId, e.UserId }, "UQ_Council_Teacher").IsUnique();

            entity.HasOne(d => d.Council).WithMany(p => p.CouncilMembers)
                .HasForeignKey(d => d.CouncilId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CM_Council");

            entity.HasOne(d => d.User).WithMany(p => p.CouncilMembers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CM_User");
        });

        modelBuilder.Entity<CriteriaGrade>(entity =>
        {
            entity.HasKey(e => e.GradeId).HasName("PK__Criteria__54F87A57DD35BE02");

            entity.HasIndex(e => e.CriteriaId, "IX_CriteriaGrades_Criteria");

            entity.HasIndex(e => new { e.UserId, e.CriteriaId }, "UQ_Mentor_Grade").IsUnique();

            entity.Property(e => e.Score).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.Criteria).WithMany(p => p.CriteriaGrades)
                .HasForeignKey(d => d.CriteriaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CG_Criteria");

            entity.HasOne(d => d.Teacher).WithMany(p => p.CriteriaGradeTeachers)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CG_Teacher");

            entity.HasOne(d => d.User).WithMany(p => p.CriteriaGradeUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CG_User");
        });

        modelBuilder.Entity<DefenseSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__DefenseS__9C8A5B498CA6E544");

            entity.HasIndex(e => e.CouncilId, "IX_Defense_Council");

            entity.HasIndex(e => e.GroupId, "IX_Defense_Group");

            entity.HasIndex(e => new { e.CouncilId, e.GroupId }, "UQ_Council_Group").IsUnique();

            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("PENDING");

            entity.HasOne(d => d.Council).WithMany(p => p.DefenseSchedules)
                .HasForeignKey(d => d.CouncilId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DS_Council");

            entity.HasOne(d => d.Group).WithMany(p => p.DefenseSchedules)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DS_Group");
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.GroupId).HasName("PK__Groups__149AF36A64CFC685");

            entity.HasIndex(e => e.MentorId, "IX_Groups_Mentor");

            entity.HasIndex(e => e.SemesterId, "IX_Groups_Semester");

            entity.Property(e => e.GroupName).HasMaxLength(255);

            entity.HasOne(d => d.Leader).WithMany(p => p.GroupLeaders)
                .HasForeignKey(d => d.LeaderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Groups_Leader");

            entity.HasOne(d => d.Mentor).WithMany(p => p.GroupMentors)
                .HasForeignKey(d => d.MentorId)
                .HasConstraintName("FK_Groups_Mentor");

            entity.HasOne(d => d.Semester).WithMany(p => p.Groups)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Groups_Semester");

            entity.HasOne(d => d.Status).WithMany(p => p.Groups)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Groups_Status");
        });

        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(e => e.GroupMemberId).HasName("PK__GroupMem__34481292A74CFE56");

            entity.HasIndex(e => e.GroupId, "IX_GroupMembers_Group");

            entity.HasIndex(e => e.UserId, "IX_GroupMembers_User");

            entity.HasIndex(e => new { e.UserId, e.GroupId }, "UQ_User_OneGroup").IsUnique();

            entity.HasOne(d => d.Group).WithMany(p => p.GroupMembers)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GM_Group");

            entity.HasOne(d => d.Status).WithMany(p => p.GroupMembers)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GM_Status");

            entity.HasOne(d => d.User).WithMany(p => p.GroupMembers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GM_User");
        });

        modelBuilder.Entity<GroupMemberStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__GroupMem__C8EE2063448AE27D");

            entity.ToTable("GroupMemberStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<GroupStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__GroupSta__C8EE2063AD734449");

            entity.ToTable("GroupStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<MentorRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__MentorRe__33A8517A6B16E524");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.StatusId).HasDefaultValue(1);

            entity.HasOne(d => d.Group).WithMany(p => p.MentorRequests)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MR_Group");

            entity.HasOne(d => d.Status).WithMany(p => p.MentorRequests)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK_MR_Status");

            entity.HasOne(d => d.User).WithMany(p => p.MentorRequests)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MR_User");
        });

        modelBuilder.Entity<MentorRequestStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__MentorRe__C8EE20632E620E5C");

            entity.ToTable("MentorRequestStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E12B4D369AB");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Noti_User");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("PK__Projects__761ABEF0B7262053");

            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Group).WithMany(p => p.Projects)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Projects_Group");

            entity.HasOne(d => d.Status).WithMany(p => p.Projects)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Projects_Status");
        });

        modelBuilder.Entity<ProjectStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__ProjectS__C8EE20635A673F2B");

            entity.ToTable("ProjectStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1AE514E27E");

            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasKey(e => e.SemesterId).HasName("PK__Semester__043301DD5B5ECBFD");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MaxGroupSize).HasDefaultValue(5);
            entity.Property(e => e.MinGroupSize).HasDefaultValue(1);
            entity.Property(e => e.SemesterName).HasMaxLength(50);
        });

        modelBuilder.Entity<StudentFinalResult>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__StudentF__97690208F0E399E9");

            entity.HasIndex(e => new { e.UserId, e.SemesterId }, "UQ_User_Semester").IsUnique();

            entity.Property(e => e.FinalizedAt).HasColumnType("datetime");
            entity.Property(e => e.Grade).HasMaxLength(5);
            entity.Property(e => e.IsFinalized).HasDefaultValue(false);
            entity.Property(e => e.TotalScore).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.Semester).WithMany(p => p.StudentFinalResults)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SFR_Semester");

            entity.HasOne(d => d.User).WithMany(p => p.StudentFinalResults)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SFR_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C439FDF80");

            entity.HasIndex(e => e.StatusId, "IX_Users_Status");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534E946C283").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Role");

            entity.HasOne(d => d.Status).WithMany(p => p.Users)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Status");
        });

        modelBuilder.Entity<UserStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__UserStat__C8EE2063D5474FE5");

            entity.ToTable("UserStatus");

            entity.Property(e => e.StatusName).HasMaxLength(50);
        });

        modelBuilder.Entity<PasswordResetOtp>(entity =>
        {
            entity.ToTable("PasswordResetOtp");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.OtpCode).IsRequired().HasMaxLength(10);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
