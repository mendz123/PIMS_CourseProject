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
                name: "GroupMemberStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GroupMem__C8EE2063448AE27D", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "GroupStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GroupSta__C8EE2063AD734449", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "MentorRequestStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MentorRe__C8EE20632E620E5C", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "ProjectStatus",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProjectS__C8EE20635A673F2B", x => x.StatusId);
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
                    table.PrimaryKey("PK__Roles__8AFACE1AE514E27E", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "Semesters",
                columns: table => new
                {
                    SemesterId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SemesterName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    MinGroupSize = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    MaxGroupSize = table.Column<int>(type: "int", nullable: true, defaultValue: 5),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Semester__043301DD5B5ECBFD", x => x.SemesterId);
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
                    table.PrimaryKey("PK__UserStat__C8EE2063D5474FE5", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "Councils",
                columns: table => new
                {
                    CouncilId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouncilName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SemesterId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Councils__1BBAA5C1103DE038", x => x.CouncilId);
                    table.ForeignKey(
                        name: "FK_Council_Semester",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "SemesterId");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__1788CC4C439FDF80", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_Role",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "RoleId");
                    table.ForeignKey(
                        name: "FK_Users_Status",
                        column: x => x.StatusId,
                        principalTable: "UserStatus",
                        principalColumn: "StatusId");
                });

            migrationBuilder.CreateTable(
                name: "Assessments",
                columns: table => new
                {
                    AssessmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SemesterId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    IsFinal = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assessme__3D2BF81E93898FB3", x => x.AssessmentId);
                    table.ForeignKey(
                        name: "FK_Assessment_Creator",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Assessment_Semester",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "SemesterId");
                });

            migrationBuilder.CreateTable(
                name: "CouncilMembers",
                columns: table => new
                {
                    CouncilMemberId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouncilId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CouncilM__457943C1587454EE", x => x.CouncilMemberId);
                    table.ForeignKey(
                        name: "FK_CM_Council",
                        column: x => x.CouncilId,
                        principalTable: "Councils",
                        principalColumn: "CouncilId");
                    table.ForeignKey(
                        name: "FK_CM_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    GroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    SemesterId = table.Column<int>(type: "int", nullable: false),
                    LeaderId = table.Column<int>(type: "int", nullable: false),
                    MentorId = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Groups__149AF36A64CFC685", x => x.GroupId);
                    table.ForeignKey(
                        name: "FK_Groups_Leader",
                        column: x => x.LeaderId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Groups_Mentor",
                        column: x => x.MentorId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Groups_Semester",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "SemesterId");
                    table.ForeignKey(
                        name: "FK_Groups_Status",
                        column: x => x.StatusId,
                        principalTable: "GroupStatus",
                        principalColumn: "StatusId");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__20CF2E12B4D369AB", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Noti_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "AssessmentCriteria",
                columns: table => new
                {
                    CriteriaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssessmentId = table.Column<int>(type: "int", nullable: false),
                    CriteriaName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assessme__FE6ADBCD67D1F7A9", x => x.CriteriaId);
                    table.ForeignKey(
                        name: "FK_AC_Assessment",
                        column: x => x.AssessmentId,
                        principalTable: "Assessments",
                        principalColumn: "AssessmentId");
                });

            migrationBuilder.CreateTable(
                name: "AssessmentScores",
                columns: table => new
                {
                    ScoreId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssessmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    IsPassed = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assessme__7DD229D109426F44", x => x.ScoreId);
                    table.ForeignKey(
                        name: "FK_AS_Assessment",
                        column: x => x.AssessmentId,
                        principalTable: "Assessments",
                        principalColumn: "AssessmentId");
                    table.ForeignKey(
                        name: "FK_AS_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "DefenseSchedules",
                columns: table => new
                {
                    ScheduleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouncilId = table.Column<int>(type: "int", nullable: false),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    DefenseDate = table.Column<DateOnly>(type: "date", nullable: true),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "PENDING")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DefenseS__9C8A5B498CA6E544", x => x.ScheduleId);
                    table.ForeignKey(
                        name: "FK_DS_Council",
                        column: x => x.CouncilId,
                        principalTable: "Councils",
                        principalColumn: "CouncilId");
                    table.ForeignKey(
                        name: "FK_DS_Group",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                });

            migrationBuilder.CreateTable(
                name: "GroupMembers",
                columns: table => new
                {
                    GroupMemberId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GroupMem__34481292A74CFE56", x => x.GroupMemberId);
                    table.ForeignKey(
                        name: "FK_GM_Group",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK_GM_Status",
                        column: x => x.StatusId,
                        principalTable: "GroupMemberStatus",
                        principalColumn: "StatusId");
                    table.ForeignKey(
                        name: "FK_GM_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "MentorRequests",
                columns: table => new
                {
                    RequestId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    TeacherComment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MentorRe__33A8517A6B16E524", x => x.RequestId);
                    table.ForeignKey(
                        name: "FK_MR_Group",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK_MR_Status",
                        column: x => x.StatusId,
                        principalTable: "MentorRequestStatus",
                        principalColumn: "StatusId");
                    table.ForeignKey(
                        name: "FK_MR_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Projects__761ABEF0B7262053", x => x.ProjectId);
                    table.ForeignKey(
                        name: "FK_Projects_Group",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK_Projects_Status",
                        column: x => x.StatusId,
                        principalTable: "ProjectStatus",
                        principalColumn: "StatusId");
                });

            migrationBuilder.CreateTable(
                name: "CouncilCriteriaGrades",
                columns: table => new
                {
                    GradeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouncilId = table.Column<int>(type: "int", nullable: false),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    CriteriaId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CouncilC__54F87A57DCDC8610", x => x.GradeId);
                    table.ForeignKey(
                        name: "FK_CCG_Council",
                        column: x => x.CouncilId,
                        principalTable: "Councils",
                        principalColumn: "CouncilId");
                    table.ForeignKey(
                        name: "FK_CCG_Criteria",
                        column: x => x.CriteriaId,
                        principalTable: "AssessmentCriteria",
                        principalColumn: "CriteriaId");
                    table.ForeignKey(
                        name: "FK_CCG_Group",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "GroupId");
                    table.ForeignKey(
                        name: "FK_CCG_Teacher",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "CriteriaGrades",
                columns: table => new
                {
                    GradeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CriteriaId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Criteria__54F87A57DD35BE02", x => x.GradeId);
                    table.ForeignKey(
                        name: "FK_CG_Criteria",
                        column: x => x.CriteriaId,
                        principalTable: "AssessmentCriteria",
                        principalColumn: "CriteriaId");
                    table.ForeignKey(
                        name: "FK_CG_Teacher",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_CG_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "UQ_Assessment_Criteria",
                table: "AssessmentCriteria",
                columns: new[] { "AssessmentId", "CriteriaName" },
                unique: true,
                filter: "[CriteriaName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Assessments_CreatedBy",
                table: "Assessments",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "UQ_Assessment_Semester",
                table: "Assessments",
                columns: new[] { "SemesterId", "Title" },
                unique: true,
                filter: "[Title] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentScores_UserId",
                table: "AssessmentScores",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ_Assessment_User",
                table: "AssessmentScores",
                columns: new[] { "AssessmentId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CouncilCriteriaGrades_CriteriaId",
                table: "CouncilCriteriaGrades",
                column: "CriteriaId");

            migrationBuilder.CreateIndex(
                name: "IX_CouncilCriteriaGrades_TeacherId",
                table: "CouncilCriteriaGrades",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_CouncilGrades_Group",
                table: "CouncilCriteriaGrades",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "UQ_Council_Grade",
                table: "CouncilCriteriaGrades",
                columns: new[] { "CouncilId", "GroupId", "TeacherId", "CriteriaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CouncilMembers_UserId",
                table: "CouncilMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ_Council_Teacher",
                table: "CouncilMembers",
                columns: new[] { "CouncilId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Councils_SemesterId",
                table: "Councils",
                column: "SemesterId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaGrades_Criteria",
                table: "CriteriaGrades",
                column: "CriteriaId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaGrades_TeacherId",
                table: "CriteriaGrades",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "UQ_Mentor_Grade",
                table: "CriteriaGrades",
                columns: new[] { "UserId", "CriteriaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Defense_Council",
                table: "DefenseSchedules",
                column: "CouncilId");

            migrationBuilder.CreateIndex(
                name: "IX_Defense_Group",
                table: "DefenseSchedules",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "UQ_Council_Group",
                table: "DefenseSchedules",
                columns: new[] { "CouncilId", "GroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_Group",
                table: "GroupMembers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_StatusId",
                table: "GroupMembers",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_User",
                table: "GroupMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ_User_OneGroup",
                table: "GroupMembers",
                columns: new[] { "UserId", "GroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Groups_LeaderId",
                table: "Groups",
                column: "LeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_Mentor",
                table: "Groups",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_Semester",
                table: "Groups",
                column: "SemesterId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_StatusId",
                table: "Groups",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorRequests_GroupId",
                table: "MentorRequests",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorRequests_StatusId",
                table: "MentorRequests",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorRequests_UserId",
                table: "MentorRequests",
                column: "UserId");

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
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Status",
                table: "Users",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__A9D10534E946C283",
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
                name: "CouncilCriteriaGrades");

            migrationBuilder.DropTable(
                name: "CouncilMembers");

            migrationBuilder.DropTable(
                name: "CriteriaGrades");

            migrationBuilder.DropTable(
                name: "DefenseSchedules");

            migrationBuilder.DropTable(
                name: "GroupMembers");

            migrationBuilder.DropTable(
                name: "MentorRequests");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "AssessmentCriteria");

            migrationBuilder.DropTable(
                name: "Councils");

            migrationBuilder.DropTable(
                name: "GroupMemberStatus");

            migrationBuilder.DropTable(
                name: "MentorRequestStatus");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "ProjectStatus");

            migrationBuilder.DropTable(
                name: "Assessments");

            migrationBuilder.DropTable(
                name: "GroupStatus");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Semesters");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "UserStatus");
        }
    }
}
