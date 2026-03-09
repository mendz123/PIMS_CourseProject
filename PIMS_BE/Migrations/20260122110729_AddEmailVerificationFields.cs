using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIMS_BE.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailVerificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK__CouncilC__54F87A57DCDC8610",
                table: "CouncilCriteriaGrades");

            migrationBuilder.DropIndex(
                name: "UQ_Council_Grade",
                table: "CouncilCriteriaGrades");

            migrationBuilder.RenameIndex(
                name: "IX_CouncilGrades_Group",
                table: "CouncilCriteriaGrades",
                newName: "IX_CouncilCriteriaGrades_GroupId");

            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerificationTokenExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "CouncilCriteriaGrades",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK__CouncilC__54F87A57D01930EF",
                table: "CouncilCriteriaGrades",
                column: "GradeId");

            migrationBuilder.CreateTable(
                name: "StudentFinalResults",
                columns: table => new
                {
                    ResultId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SemesterId = table.Column<int>(type: "int", nullable: false),
                    TotalScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Grade = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: true),
                    IsPassed = table.Column<bool>(type: "bit", nullable: true),
                    IsFinalized = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    FinalizedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__StudentF__97690208F0E399E9", x => x.ResultId);
                    table.ForeignKey(
                        name: "FK_SFR_Semester",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "SemesterId");
                    table.ForeignKey(
                        name: "FK_SFR_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CouncilCriteriaGrades_UserId",
                table: "CouncilCriteriaGrades",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ_Council_Grade",
                table: "CouncilCriteriaGrades",
                columns: new[] { "CouncilId", "GroupId", "UserId", "TeacherId", "CriteriaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentFinalResults_SemesterId",
                table: "StudentFinalResults",
                column: "SemesterId");

            migrationBuilder.CreateIndex(
                name: "UQ_User_Semester",
                table: "StudentFinalResults",
                columns: new[] { "UserId", "SemesterId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CCG_User",
                table: "CouncilCriteriaGrades",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CCG_User",
                table: "CouncilCriteriaGrades");

            migrationBuilder.DropTable(
                name: "StudentFinalResults");

            migrationBuilder.DropPrimaryKey(
                name: "PK__CouncilC__54F87A57D01930EF",
                table: "CouncilCriteriaGrades");

            migrationBuilder.DropIndex(
                name: "IX_CouncilCriteriaGrades_UserId",
                table: "CouncilCriteriaGrades");

            migrationBuilder.DropIndex(
                name: "UQ_Council_Grade",
                table: "CouncilCriteriaGrades");

            migrationBuilder.DropColumn(
                name: "EmailVerificationToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailVerificationTokenExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CouncilCriteriaGrades");

            migrationBuilder.RenameIndex(
                name: "IX_CouncilCriteriaGrades_GroupId",
                table: "CouncilCriteriaGrades",
                newName: "IX_CouncilGrades_Group");

            migrationBuilder.AddPrimaryKey(
                name: "PK__CouncilC__54F87A57DCDC8610",
                table: "CouncilCriteriaGrades",
                column: "GradeId");

            migrationBuilder.CreateIndex(
                name: "UQ_Council_Grade",
                table: "CouncilCriteriaGrades",
                columns: new[] { "CouncilId", "GroupId", "TeacherId", "CriteriaId" },
                unique: true);
        }
    }
}
