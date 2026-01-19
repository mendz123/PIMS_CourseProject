using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIMS_BE.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ClassSta__C8EE20632F4A82AE", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "ClassStudentStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ClassStu__C8EE2063330A2146", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "CouncilStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CouncilS__C8EE206374BAD9B5", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "GroupStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GroupSta__C8EE2063B130FE64", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "ProjectStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProjectS__C8EE20635FBCF8C4", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__8AFACE1A01D83829", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "Semesters",
                columns: table => new
                {
                    SemesterId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SemesterName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Semester__043301DD7BD5F7B2", x => x.SemesterId);
                });

            migrationBuilder.CreateTable(
                name: "UserStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserStat__C8EE2063AD1095E3", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    RoleId = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    EmailVerificationToken = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    EmailVerificationTokenExpiry = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__1788CC4CF8712CB5", x => x.UserId);
                    table.ForeignKey(
                        name: "FK__Users__RoleId__35BCFE0A",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "RoleId");
                    table.ForeignKey(
                        name: "FK__Users__StatusId__36B12243",
                        column: x => x.StatusId,
                        principalTable: "UserStatus",
                        principalColumn: "StatusId");
                });

            migrationBuilder.CreateTable(
                name: "Classes",
                columns: table => new
                {
                    ClassId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassCode = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    ClassName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    SemesterId = table.Column<int>(type: "int", nullable: true),
                    TeacherId = table.Column<int>(type: "int", nullable: true),
                    MinGroupSize = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    MaxGroupSize = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    GroupDeadline = table.Column<DateTime>(type: "datetime", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Classes__CB1927C0641262A6", x => x.ClassId);
                    table.ForeignKey(
                        name: "FK__Classes__Semeste__3B75D760",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "SemesterId");
                    table.ForeignKey(
                        name: "FK__Classes__StatusI__3F466844",
                        column: x => x.StatusId,
                        principalTable: "ClassStatus",
                        principalColumn: "StatusId");
                    table.ForeignKey(
                        name: "FK__Classes__Teacher__3C69FB99",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__20CF2E125F828258", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK__Notificat__UserI__0F624AF8",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    RevokedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__RefreshT__3214EC07452472AF", x => x.Id);
                    table.ForeignKey(
                        name: "FK__RefreshTo__UserI__2180FB33",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Assessments",
                columns: table => new
                {
                    AssessmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Weight = table.Column<double>(type: "float", nullable: false),
                    MinScoreToPass = table.Column<double>(type: "float", nullable: true, defaultValue: 0.0),
                    IsFinal = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    DueDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assessme__3D2BF81E9BCA0F4C", x => x.AssessmentId);
                    table.ForeignKey(
                        name: "FK__Assessmen__Class__571DF1D5",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "ClassId");
                });

            migrationBuilder.CreateTable(
                name: "ClassStudents",
                columns: table => new
                {
                    ClassStudentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    StudentEmail = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ClassStu__B8147819E3D9DF8A", x => x.ClassStudentId);
                    table.ForeignKey(
                        name: "FK__ClassStud__Class__4316F928",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "ClassId");
                    table.ForeignKey(
                        name: "FK__ClassStud__Statu__44FF419A",
                        column: x => x.StatusId,
                        principalTable: "ClassStudentStatus",
                        principalColumn: "StatusId");
                    table.ForeignKey(
                        name: "FK__ClassStud__Stude__440B1D61",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    GroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    GroupName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    LeaderId = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Groups__149AF36AEAABF7A7", x => x.GroupId);
                    table.ForeignKey(
                        name: "FK__Groups__ClassId__47DBAE45",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "ClassId");
                    table.ForeignKey(
                        name: "FK__Groups__LeaderId__48CFD27E",
                        column: x => x.LeaderId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK__Groups__StatusId__49C3F6B7",
                        column: x => x.StatusId,
                        principalTable: "GroupStatus",
                        principalColumn: "StatusId");
                });

            migrationBuilder.CreateTable(
                name: "StudentCourseResults",
                columns: table => new
                {
                    ResultId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: true),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    FinalAverageScore = table.Column<double>(type: "float", nullable: true),
                    CourseStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__StudentC__97690208A2D6AD6D", x => x.ResultId);
                    table.ForeignKey(
                        name: "FK__StudentCo__Class__0B91BA14",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "ClassId");
                    table.ForeignKey(
                        name: "FK__StudentCo__Stude__0A9D95DB",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "AssessmentCriteria",
                columns: table => new
                {
                    CriteriaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssessmentId = table.Column<int>(type: "int", nullable: true),
                    CriteriaName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Weight = table.Column<double>(type: "float", nullable: true, defaultValue: 1.0),
                    MaxScore = table.Column<double>(type: "float", nullable: true, defaultValue: 10.0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assessme__FE6ADBCDC69F72BC", x => x.CriteriaId);
                    table.ForeignKey(
                        name: "FK__Assessmen__Asses__5CD6CB2B",
                        column: x => x.AssessmentId,
                        principalTable: "Assessments",
                        principalColumn: "AssessmentId");
                });

            migrationBuilder.CreateTable(
                name: "Councils",
                columns: table => new
                {
                    CouncilId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouncilName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AssessmentId = table.Column<int>(type: "int", nullable: true),
                    Round = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    StatusId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    DefenseDate = table.Column<DateOnly>(type: "date", nullable: true),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Councils__1BBAA5C13C3157EC", x => x.CouncilId);
                    table.ForeignKey(
                        name: "FK__Councils__Assess__619B8048",
                        column: x => x.AssessmentId,
                        principalTable: "Assessments",
                        principalColumn: "AssessmentId");
                    table.ForeignKey(
                        name: "FK__Councils__Status__6383C8BA",
                        column: x => x.StatusId,
                        principalTable: "CouncilStatus",
                        principalColumn: "StatusId");
                });

            migrationBuilder.CreateTable(
                name: "AssessmentSubmissions",
                columns: table => new
                {
                    SubmissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssessmentId = table.Column<int>(type: "int", nullable: true),
                    GroupId = table.Column<int>(type: "int", nullable: true),
                    UploadedBy = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assessme__449EE125FD60ECF8", x => x.SubmissionId);
                    table.ForeignKey(
                        name: "FK__Assessmen__Asses__6C190EBB",
                        column: x => x.AssessmentId,
                        principalTable: "Assessments",
                        principalColumn: "AssessmentId");
                    table.ForeignKey(
                        name: "FK__Assessmen__Group__6D0D32F4",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK__Assessmen__Uploa__6E01572D",
                        column: x => x.UploadedBy,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "GroupMembers",
                columns: table => new
                {
                    GroupMemberId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: true),
                    StudentId = table.Column<int>(type: "int", nullable: true),
                    JoinedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "ACTIVE"),
                    LeftAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GroupMem__34481292E34BB5D6", x => x.GroupMemberId);
                    table.ForeignKey(
                        name: "FK__GroupMemb__Group__4D94879B",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK__GroupMemb__Stude__4E88ABD4",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: true),
                    TeacherNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Projects__761ABEF0F1049B07", x => x.ProjectId);
                    table.ForeignKey(
                        name: "FK__Projects__GroupI__52593CB8",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK__Projects__Status__534D60F1",
                        column: x => x.StatusId,
                        principalTable: "ProjectStatus",
                        principalColumn: "StatusId");
                });

            migrationBuilder.CreateTable(
                name: "AssessmentScores",
                columns: table => new
                {
                    ScoreId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssessmentId = table.Column<int>(type: "int", nullable: true),
                    StudentId = table.Column<int>(type: "int", nullable: true),
                    GroupId = table.Column<int>(type: "int", nullable: true),
                    Score = table.Column<double>(type: "float", nullable: true),
                    IsPassed = table.Column<bool>(type: "bit", nullable: true),
                    CouncilId = table.Column<int>(type: "int", nullable: true),
                    GradedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assessme__7DD229D1FB206AFF", x => x.ScoreId);
                    table.ForeignKey(
                        name: "FK__Assessmen__Asses__03F0984C",
                        column: x => x.AssessmentId,
                        principalTable: "Assessments",
                        principalColumn: "AssessmentId");
                    table.ForeignKey(
                        name: "FK__Assessmen__Counc__06CD04F7",
                        column: x => x.CouncilId,
                        principalTable: "Councils",
                        principalColumn: "CouncilId");
                    table.ForeignKey(
                        name: "FK__Assessmen__Group__05D8E0BE",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK__Assessmen__Stude__04E4BC85",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "DefenseSchedules",
                columns: table => new
                {
                    ScheduleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouncilId = table.Column<int>(type: "int", nullable: true),
                    GroupId = table.Column<int>(type: "int", nullable: true),
                    DefenseDate = table.Column<DateOnly>(type: "date", nullable: true),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DefenseS__9C8A5B49B70F2DED", x => x.ScheduleId);
                    table.ForeignKey(
                        name: "FK__DefenseSc__Counc__2739D489",
                        column: x => x.CouncilId,
                        principalTable: "Councils",
                        principalColumn: "CouncilId");
                    table.ForeignKey(
                        name: "FK__DefenseSc__Group__282DF8C2",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                });

            migrationBuilder.CreateTable(
                name: "Graders",
                columns: table => new
                {
                    GraderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssessmentId = table.Column<int>(type: "int", nullable: true),
                    TeacherId = table.Column<int>(type: "int", nullable: true),
                    CouncilId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Graders__9DDC5656C9FFCB1F", x => x.GraderId);
                    table.ForeignKey(
                        name: "FK__Graders__Assessm__6754599E",
                        column: x => x.AssessmentId,
                        principalTable: "Assessments",
                        principalColumn: "AssessmentId");
                    table.ForeignKey(
                        name: "FK__Graders__Council__693CA210",
                        column: x => x.CouncilId,
                        principalTable: "Councils",
                        principalColumn: "CouncilId");
                    table.ForeignKey(
                        name: "FK__Graders__Teacher__68487DD7",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "SubmissionFiles",
                columns: table => new
                {
                    FileId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubmissionId = table.Column<int>(type: "int", nullable: true),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FileUrl = table.Column<string>(type: "varchar(1000)", unicode: false, maxLength: 1000, nullable: true),
                    FileType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Submissi__6F0F98BF9A4B5A58", x => x.FileId);
                    table.ForeignKey(
                        name: "FK__Submissio__Submi__71D1E811",
                        column: x => x.SubmissionId,
                        principalTable: "AssessmentSubmissions",
                        principalColumn: "SubmissionId");
                });

            migrationBuilder.CreateTable(
                name: "CriteriaGrades",
                columns: table => new
                {
                    GradeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GraderId = table.Column<int>(type: "int", nullable: true),
                    StudentId = table.Column<int>(type: "int", nullable: true),
                    CriteriaId = table.Column<int>(type: "int", nullable: true),
                    Score = table.Column<double>(type: "float", nullable: true),
                    GradedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Criteria__54F87A57F45CBC05", x => x.GradeId);
                    table.ForeignKey(
                        name: "FK__CriteriaG__Crite__7E37BEF6",
                        column: x => x.CriteriaId,
                        principalTable: "AssessmentCriteria",
                        principalColumn: "CriteriaId");
                    table.ForeignKey(
                        name: "FK__CriteriaG__Grade__7C4F7684",
                        column: x => x.GraderId,
                        principalTable: "Graders",
                        principalColumn: "GraderId");
                    table.ForeignKey(
                        name: "FK__CriteriaG__Stude__7D439ABD",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "TeacherAssessments",
                columns: table => new
                {
                    TeacherAssessmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GraderId = table.Column<int>(type: "int", nullable: true),
                    StudentId = table.Column<int>(type: "int", nullable: true),
                    TeacherNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RawScore = table.Column<double>(type: "float", nullable: true),
                    GradedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__TeacherA__CCB01FE9C22BF311", x => x.TeacherAssessmentId);
                    table.ForeignKey(
                        name: "FK__TeacherAs__Grade__76969D2E",
                        column: x => x.GraderId,
                        principalTable: "Graders",
                        principalColumn: "GraderId");
                    table.ForeignKey(
                        name: "FK__TeacherAs__Stude__778AC167",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentCriteria_AssessmentId",
                table: "AssessmentCriteria",
                column: "AssessmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Assessments_ClassId",
                table: "Assessments",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentScores_AssessmentId",
                table: "AssessmentScores",
                column: "AssessmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentScores_CouncilId",
                table: "AssessmentScores",
                column: "CouncilId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentScores_GroupId",
                table: "AssessmentScores",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "UC_Student_Assessment",
                table: "AssessmentScores",
                columns: new[] { "StudentId", "AssessmentId", "CouncilId" },
                unique: true,
                filter: "[StudentId] IS NOT NULL AND [AssessmentId] IS NOT NULL AND [CouncilId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentSubmissions_AssessmentId",
                table: "AssessmentSubmissions",
                column: "AssessmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentSubmissions_GroupId",
                table: "AssessmentSubmissions",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentSubmissions_UploadedBy",
                table: "AssessmentSubmissions",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_SemesterId",
                table: "Classes",
                column: "SemesterId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_StatusId",
                table: "Classes",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_TeacherId",
                table: "Classes",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "UQ__Classes__2ECD4A55A8E7D5AF",
                table: "Classes",
                column: "ClassCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassStudents_ClassId",
                table: "ClassStudents",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassStudents_StatusId",
                table: "ClassStudents",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassStudents_StudentId",
                table: "ClassStudents",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Councils_AssessmentId",
                table: "Councils",
                column: "AssessmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Councils_StatusId",
                table: "Councils",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaGrades_CriteriaId",
                table: "CriteriaGrades",
                column: "CriteriaId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaGrades_StudentId",
                table: "CriteriaGrades",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "UC_Grader_Student_Criteria",
                table: "CriteriaGrades",
                columns: new[] { "GraderId", "StudentId", "CriteriaId" },
                unique: true,
                filter: "[GraderId] IS NOT NULL AND [StudentId] IS NOT NULL AND [CriteriaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DefenseSchedules_CouncilId",
                table: "DefenseSchedules",
                column: "CouncilId");

            migrationBuilder.CreateIndex(
                name: "IX_DefenseSchedules_GroupId",
                table: "DefenseSchedules",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Graders_AssessmentId",
                table: "Graders",
                column: "AssessmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Graders_CouncilId",
                table: "Graders",
                column: "CouncilId");

            migrationBuilder.CreateIndex(
                name: "IX_Graders_TeacherId",
                table: "Graders",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_GroupId",
                table: "GroupMembers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_StudentId",
                table: "GroupMembers",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_ClassId",
                table: "Groups",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_LeaderId",
                table: "Groups",
                column: "LeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_StatusId",
                table: "Groups",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_GroupId",
                table: "Projects",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_StatusId",
                table: "Projects",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentCourseResults_ClassId",
                table: "StudentCourseResults",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentCourseResults_StudentId",
                table: "StudentCourseResults",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionFiles_SubmissionId",
                table: "SubmissionFiles",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherAssessments_StudentId",
                table: "TeacherAssessments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "UC_Grader_Student",
                table: "TeacherAssessments",
                columns: new[] { "GraderId", "StudentId" },
                unique: true,
                filter: "[GraderId] IS NOT NULL AND [StudentId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_StatusId",
                table: "Users",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__A9D10534F7334DFE",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssessmentScores");

            migrationBuilder.DropTable(
                name: "ClassStudents");

            migrationBuilder.DropTable(
                name: "CriteriaGrades");

            migrationBuilder.DropTable(
                name: "DefenseSchedules");

            migrationBuilder.DropTable(
                name: "GroupMembers");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "StudentCourseResults");

            migrationBuilder.DropTable(
                name: "SubmissionFiles");

            migrationBuilder.DropTable(
                name: "TeacherAssessments");

            migrationBuilder.DropTable(
                name: "ClassStudentStatus");

            migrationBuilder.DropTable(
                name: "AssessmentCriteria");

            migrationBuilder.DropTable(
                name: "ProjectStatus");

            migrationBuilder.DropTable(
                name: "AssessmentSubmissions");

            migrationBuilder.DropTable(
                name: "Graders");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "Councils");

            migrationBuilder.DropTable(
                name: "GroupStatus");

            migrationBuilder.DropTable(
                name: "Assessments");

            migrationBuilder.DropTable(
                name: "CouncilStatus");

            migrationBuilder.DropTable(
                name: "Classes");

            migrationBuilder.DropTable(
                name: "Semesters");

            migrationBuilder.DropTable(
                name: "ClassStatus");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "UserStatus");
        }
    }
}
