using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIMS_BE.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectSubmissionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "EmailVerificationTokenExpiresAt",
                table: "Users",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EmailVerificationToken",
                table: "Users",
                type: "varchar(255)",
                unicode: false,
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "ProjectSubmissions",
                columns: table => new
                {
                    SubmissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    SubmitterId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ReportUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileResourceId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProjectS__449EE125918F1902", x => x.SubmissionId);
                    table.ForeignKey(
                        name: "FK_Submission_Project",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId");
                });

            migrationBuilder.CreateTable(
                name: "ProjectTemplates",
                columns: table => new
                {
                    TemplateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SemesterId = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    TemplateName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TemplateUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileResourceId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProjectT__F87ADD2755CD81C4", x => x.TemplateId);
                    table.ForeignKey(
                        name: "FK_Template_Semester",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "SemesterId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectSubmissions_ProjectId",
                table: "ProjectSubmissions",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTemplates_SemesterId",
                table: "ProjectTemplates",
                column: "SemesterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectSubmissions");

            migrationBuilder.DropTable(
                name: "ProjectTemplates");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EmailVerificationTokenExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EmailVerificationToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldUnicode: false,
                oldMaxLength: 255,
                oldNullable: true);
        }
    }
}
