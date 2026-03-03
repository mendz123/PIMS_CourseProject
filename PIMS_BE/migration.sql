IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [GroupMemberStatus] (
    [StatusId] int NOT NULL IDENTITY,
    [StatusName] nvarchar(50) NULL,
    CONSTRAINT [PK__GroupMem__C8EE2063448AE27D] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [GroupStatus] (
    [StatusId] int NOT NULL IDENTITY,
    [StatusName] nvarchar(50) NULL,
    CONSTRAINT [PK__GroupSta__C8EE2063AD734449] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [MentorRequestStatus] (
    [StatusId] int NOT NULL IDENTITY,
    [StatusName] nvarchar(50) NULL,
    CONSTRAINT [PK__MentorRe__C8EE20632E620E5C] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [ProjectStatus] (
    [StatusId] int NOT NULL IDENTITY,
    [StatusName] nvarchar(50) NULL,
    CONSTRAINT [PK__ProjectS__C8EE20635A673F2B] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [Roles] (
    [RoleId] int NOT NULL IDENTITY,
    [RoleName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK__Roles__8AFACE1AE514E27E] PRIMARY KEY ([RoleId])
);
GO

CREATE TABLE [Semesters] (
    [SemesterId] int NOT NULL IDENTITY,
    [SemesterName] nvarchar(50) NULL,
    [StartDate] date NULL,
    [EndDate] date NULL,
    [MinGroupSize] int NULL DEFAULT 1,
    [MaxGroupSize] int NULL DEFAULT 5,
    [IsActive] bit NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK__Semester__043301DD5B5ECBFD] PRIMARY KEY ([SemesterId])
);
GO

CREATE TABLE [UserStatus] (
    [StatusId] int NOT NULL IDENTITY,
    [StatusName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK__UserStat__C8EE2063D5474FE5] PRIMARY KEY ([StatusId])
);
GO

CREATE TABLE [Councils] (
    [CouncilId] int NOT NULL IDENTITY,
    [CouncilName] nvarchar(100) NULL,
    [SemesterId] int NOT NULL,
    CONSTRAINT [PK__Councils__1BBAA5C1103DE038] PRIMARY KEY ([CouncilId]),
    CONSTRAINT [FK_Council_Semester] FOREIGN KEY ([SemesterId]) REFERENCES [Semesters] ([SemesterId])
);
GO

CREATE TABLE [Users] (
    [UserId] int NOT NULL IDENTITY,
    [Email] varchar(100) NOT NULL,
    [PasswordHash] varchar(255) NULL,
    [FullName] nvarchar(255) NULL,
    [RoleId] int NOT NULL,
    [StatusId] int NOT NULL,
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    [UpdatedAt] datetime NULL,
    CONSTRAINT [PK__Users__1788CC4C439FDF80] PRIMARY KEY ([UserId]),
    CONSTRAINT [FK_Users_Role] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId]),
    CONSTRAINT [FK_Users_Status] FOREIGN KEY ([StatusId]) REFERENCES [UserStatus] ([StatusId])
);
GO

CREATE TABLE [Assessments] (
    [AssessmentId] int NOT NULL IDENTITY,
    [SemesterId] int NOT NULL,
    [Title] nvarchar(255) NULL,
    [Weight] decimal(5,2) NULL,
    [IsFinal] bit NULL DEFAULT CAST(0 AS bit),
    [IsLocked] bit NULL DEFAULT CAST(0 AS bit),
    [CreatedBy] int NOT NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__Assessme__3D2BF81E93898FB3] PRIMARY KEY ([AssessmentId]),
    CONSTRAINT [FK_Assessment_Creator] FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([UserId]),
    CONSTRAINT [FK_Assessment_Semester] FOREIGN KEY ([SemesterId]) REFERENCES [Semesters] ([SemesterId])
);
GO

CREATE TABLE [CouncilMembers] (
    [CouncilMemberId] int NOT NULL IDENTITY,
    [CouncilId] int NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK__CouncilM__457943C1587454EE] PRIMARY KEY ([CouncilMemberId]),
    CONSTRAINT [FK_CM_Council] FOREIGN KEY ([CouncilId]) REFERENCES [Councils] ([CouncilId]),
    CONSTRAINT [FK_CM_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [Groups] (
    [GroupId] int NOT NULL IDENTITY,
    [GroupName] nvarchar(255) NULL,
    [SemesterId] int NOT NULL,
    [LeaderId] int NOT NULL,
    [MentorId] int NULL,
    [StatusId] int NOT NULL,
    CONSTRAINT [PK__Groups__149AF36A64CFC685] PRIMARY KEY ([GroupId]),
    CONSTRAINT [FK_Groups_Leader] FOREIGN KEY ([LeaderId]) REFERENCES [Users] ([UserId]),
    CONSTRAINT [FK_Groups_Mentor] FOREIGN KEY ([MentorId]) REFERENCES [Users] ([UserId]),
    CONSTRAINT [FK_Groups_Semester] FOREIGN KEY ([SemesterId]) REFERENCES [Semesters] ([SemesterId]),
    CONSTRAINT [FK_Groups_Status] FOREIGN KEY ([StatusId]) REFERENCES [GroupStatus] ([StatusId])
);
GO

CREATE TABLE [Notifications] (
    [NotificationId] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Title] nvarchar(255) NULL,
    [Content] nvarchar(max) NULL,
    [IsRead] bit NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__Notifica__20CF2E12B4D369AB] PRIMARY KEY ([NotificationId]),
    CONSTRAINT [FK_Noti_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [AssessmentCriteria] (
    [CriteriaId] int NOT NULL IDENTITY,
    [AssessmentId] int NOT NULL,
    [CriteriaName] nvarchar(255) NULL,
    [Weight] decimal(5,2) NULL,
    CONSTRAINT [PK__Assessme__FE6ADBCD67D1F7A9] PRIMARY KEY ([CriteriaId]),
    CONSTRAINT [FK_AC_Assessment] FOREIGN KEY ([AssessmentId]) REFERENCES [Assessments] ([AssessmentId])
);
GO

CREATE TABLE [AssessmentScores] (
    [ScoreId] int NOT NULL IDENTITY,
    [AssessmentId] int NOT NULL,
    [UserId] int NOT NULL,
    [Score] decimal(5,2) NULL,
    [IsPassed] bit NULL,
    CONSTRAINT [PK__Assessme__7DD229D109426F44] PRIMARY KEY ([ScoreId]),
    CONSTRAINT [FK_AS_Assessment] FOREIGN KEY ([AssessmentId]) REFERENCES [Assessments] ([AssessmentId]),
    CONSTRAINT [FK_AS_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [DefenseSchedules] (
    [ScheduleId] int NOT NULL IDENTITY,
    [CouncilId] int NOT NULL,
    [GroupId] int NOT NULL,
    [DefenseDate] date NULL,
    [StartTime] time NULL,
    [EndTime] time NULL,
    [Location] nvarchar(255) NULL,
    [Status] nvarchar(50) NULL DEFAULT N'PENDING',
    CONSTRAINT [PK__DefenseS__9C8A5B498CA6E544] PRIMARY KEY ([ScheduleId]),
    CONSTRAINT [FK_DS_Council] FOREIGN KEY ([CouncilId]) REFERENCES [Councils] ([CouncilId]),
    CONSTRAINT [FK_DS_Group] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([GroupId])
);
GO

CREATE TABLE [GroupMembers] (
    [GroupMemberId] int NOT NULL IDENTITY,
    [GroupId] int NOT NULL,
    [UserId] int NOT NULL,
    [StatusId] int NOT NULL,
    CONSTRAINT [PK__GroupMem__34481292A74CFE56] PRIMARY KEY ([GroupMemberId]),
    CONSTRAINT [FK_GM_Group] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([GroupId]),
    CONSTRAINT [FK_GM_Status] FOREIGN KEY ([StatusId]) REFERENCES [GroupMemberStatus] ([StatusId]),
    CONSTRAINT [FK_GM_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [MentorRequests] (
    [RequestId] int NOT NULL IDENTITY,
    [GroupId] int NOT NULL,
    [UserId] int NOT NULL,
    [Message] nvarchar(max) NULL,
    [StatusId] int NULL DEFAULT 1,
    [TeacherComment] nvarchar(max) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__MentorRe__33A8517A6B16E524] PRIMARY KEY ([RequestId]),
    CONSTRAINT [FK_MR_Group] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([GroupId]),
    CONSTRAINT [FK_MR_Status] FOREIGN KEY ([StatusId]) REFERENCES [MentorRequestStatus] ([StatusId]),
    CONSTRAINT [FK_MR_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [Projects] (
    [ProjectId] int NOT NULL IDENTITY,
    [GroupId] int NOT NULL,
    [Title] nvarchar(255) NULL,
    [Description] nvarchar(max) NULL,
    [StatusId] int NOT NULL,
    CONSTRAINT [PK__Projects__761ABEF0B7262053] PRIMARY KEY ([ProjectId]),
    CONSTRAINT [FK_Projects_Group] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([GroupId]),
    CONSTRAINT [FK_Projects_Status] FOREIGN KEY ([StatusId]) REFERENCES [ProjectStatus] ([StatusId])
);
GO

CREATE TABLE [CouncilCriteriaGrades] (
    [GradeId] int NOT NULL IDENTITY,
    [CouncilId] int NOT NULL,
    [GroupId] int NOT NULL,
    [TeacherId] int NOT NULL,
    [CriteriaId] int NOT NULL,
    [Score] decimal(5,2) NULL,
    CONSTRAINT [PK__CouncilC__54F87A57DCDC8610] PRIMARY KEY ([GradeId]),
    CONSTRAINT [FK_CCG_Council] FOREIGN KEY ([CouncilId]) REFERENCES [Councils] ([CouncilId]),
    CONSTRAINT [FK_CCG_Criteria] FOREIGN KEY ([CriteriaId]) REFERENCES [AssessmentCriteria] ([CriteriaId]),
    CONSTRAINT [FK_CCG_Group] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([GroupId]),
    CONSTRAINT [FK_CCG_Teacher] FOREIGN KEY ([TeacherId]) REFERENCES [Users] ([UserId])
);
GO

CREATE TABLE [CriteriaGrades] (
    [GradeId] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [CriteriaId] int NOT NULL,
    [TeacherId] int NOT NULL,
    [Score] decimal(5,2) NULL,
    CONSTRAINT [PK__Criteria__54F87A57DD35BE02] PRIMARY KEY ([GradeId]),
    CONSTRAINT [FK_CG_Criteria] FOREIGN KEY ([CriteriaId]) REFERENCES [AssessmentCriteria] ([CriteriaId]),
    CONSTRAINT [FK_CG_Teacher] FOREIGN KEY ([TeacherId]) REFERENCES [Users] ([UserId]),
    CONSTRAINT [FK_CG_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE UNIQUE INDEX [UQ_Assessment_Criteria] ON [AssessmentCriteria] ([AssessmentId], [CriteriaName]) WHERE [CriteriaName] IS NOT NULL;
GO

CREATE INDEX [IX_Assessments_CreatedBy] ON [Assessments] ([CreatedBy]);
GO

CREATE UNIQUE INDEX [UQ_Assessment_Semester] ON [Assessments] ([SemesterId], [Title]) WHERE [Title] IS NOT NULL;
GO

CREATE INDEX [IX_AssessmentScores_UserId] ON [AssessmentScores] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_Assessment_User] ON [AssessmentScores] ([AssessmentId], [UserId]);
GO

CREATE INDEX [IX_CouncilCriteriaGrades_CriteriaId] ON [CouncilCriteriaGrades] ([CriteriaId]);
GO

CREATE INDEX [IX_CouncilCriteriaGrades_TeacherId] ON [CouncilCriteriaGrades] ([TeacherId]);
GO

CREATE INDEX [IX_CouncilGrades_Group] ON [CouncilCriteriaGrades] ([GroupId]);
GO

CREATE UNIQUE INDEX [UQ_Council_Grade] ON [CouncilCriteriaGrades] ([CouncilId], [GroupId], [TeacherId], [CriteriaId]);
GO

CREATE INDEX [IX_CouncilMembers_UserId] ON [CouncilMembers] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_Council_Teacher] ON [CouncilMembers] ([CouncilId], [UserId]);
GO

CREATE INDEX [IX_Councils_SemesterId] ON [Councils] ([SemesterId]);
GO

CREATE INDEX [IX_CriteriaGrades_Criteria] ON [CriteriaGrades] ([CriteriaId]);
GO

CREATE INDEX [IX_CriteriaGrades_TeacherId] ON [CriteriaGrades] ([TeacherId]);
GO

CREATE UNIQUE INDEX [UQ_Mentor_Grade] ON [CriteriaGrades] ([UserId], [CriteriaId]);
GO

CREATE INDEX [IX_Defense_Council] ON [DefenseSchedules] ([CouncilId]);
GO

CREATE INDEX [IX_Defense_Group] ON [DefenseSchedules] ([GroupId]);
GO

CREATE UNIQUE INDEX [UQ_Council_Group] ON [DefenseSchedules] ([CouncilId], [GroupId]);
GO

CREATE INDEX [IX_GroupMembers_Group] ON [GroupMembers] ([GroupId]);
GO

CREATE INDEX [IX_GroupMembers_StatusId] ON [GroupMembers] ([StatusId]);
GO

CREATE INDEX [IX_GroupMembers_User] ON [GroupMembers] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_User_OneGroup] ON [GroupMembers] ([UserId], [GroupId]);
GO

CREATE INDEX [IX_Groups_LeaderId] ON [Groups] ([LeaderId]);
GO

CREATE INDEX [IX_Groups_Mentor] ON [Groups] ([MentorId]);
GO

CREATE INDEX [IX_Groups_Semester] ON [Groups] ([SemesterId]);
GO

CREATE INDEX [IX_Groups_StatusId] ON [Groups] ([StatusId]);
GO

CREATE INDEX [IX_MentorRequests_GroupId] ON [MentorRequests] ([GroupId]);
GO

CREATE INDEX [IX_MentorRequests_StatusId] ON [MentorRequests] ([StatusId]);
GO

CREATE INDEX [IX_MentorRequests_UserId] ON [MentorRequests] ([UserId]);
GO

CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
GO

CREATE INDEX [IX_Projects_GroupId] ON [Projects] ([GroupId]);
GO

CREATE INDEX [IX_Projects_StatusId] ON [Projects] ([StatusId]);
GO

CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
GO

CREATE INDEX [IX_Users_Status] ON [Users] ([StatusId]);
GO

CREATE UNIQUE INDEX [UQ__Users__A9D10534E946C283] ON [Users] ([Email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260120074023_InitialCreate', N'8.0.11');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [CouncilCriteriaGrades] DROP CONSTRAINT [PK__CouncilC__54F87A57DCDC8610];
GO

DROP INDEX [UQ_Council_Grade] ON [CouncilCriteriaGrades];
GO

EXEC sp_rename N'[CouncilCriteriaGrades].[IX_CouncilGrades_Group]', N'IX_CouncilCriteriaGrades_GroupId', N'INDEX';
GO

ALTER TABLE [Users] ADD [EmailVerificationToken] nvarchar(max) NULL;
GO

ALTER TABLE [Users] ADD [EmailVerificationTokenExpiresAt] datetime2 NULL;
GO

ALTER TABLE [CouncilCriteriaGrades] ADD [UserId] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [CouncilCriteriaGrades] ADD CONSTRAINT [PK__CouncilC__54F87A57D01930EF] PRIMARY KEY ([GradeId]);
GO

CREATE TABLE [StudentFinalResults] (
    [ResultId] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [SemesterId] int NOT NULL,
    [TotalScore] decimal(5,2) NULL,
    [Grade] nvarchar(5) NULL,
    [IsPassed] bit NULL,
    [IsFinalized] bit NULL DEFAULT CAST(0 AS bit),
    [FinalizedAt] datetime NULL,
    CONSTRAINT [PK__StudentF__97690208F0E399E9] PRIMARY KEY ([ResultId]),
    CONSTRAINT [FK_SFR_Semester] FOREIGN KEY ([SemesterId]) REFERENCES [Semesters] ([SemesterId]),
    CONSTRAINT [FK_SFR_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId])
);
GO

CREATE INDEX [IX_CouncilCriteriaGrades_UserId] ON [CouncilCriteriaGrades] ([UserId]);
GO

CREATE UNIQUE INDEX [UQ_Council_Grade] ON [CouncilCriteriaGrades] ([CouncilId], [GroupId], [UserId], [TeacherId], [CriteriaId]);
GO

CREATE INDEX [IX_StudentFinalResults_SemesterId] ON [StudentFinalResults] ([SemesterId]);
GO

CREATE UNIQUE INDEX [UQ_User_Semester] ON [StudentFinalResults] ([UserId], [SemesterId]);
GO

ALTER TABLE [CouncilCriteriaGrades] ADD CONSTRAINT [FK_CCG_User] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260122110729_AddEmailVerificationFields', N'8.0.11');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Users]') AND [c].[name] = N'EmailVerificationTokenExpiresAt');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Users] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Users] ALTER COLUMN [EmailVerificationTokenExpiresAt] datetime NULL;
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Users]') AND [c].[name] = N'EmailVerificationToken');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Users] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Users] ALTER COLUMN [EmailVerificationToken] varchar(255) NULL;
GO

CREATE TABLE [ProjectSubmissions] (
    [SubmissionId] int NOT NULL IDENTITY,
    [ProjectId] int NOT NULL,
    [SubmitterId] int NOT NULL,
    [FileName] nvarchar(255) NOT NULL,
    [ReportUrl] nvarchar(max) NOT NULL,
    [FileResourceId] nvarchar(255) NULL,
    [SubmittedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__ProjectS__449EE125918F1902] PRIMARY KEY ([SubmissionId]),
    CONSTRAINT [FK_Submission_Project] FOREIGN KEY ([ProjectId]) REFERENCES [Projects] ([ProjectId])
);
GO

CREATE TABLE [ProjectTemplates] (
    [TemplateId] int NOT NULL IDENTITY,
    [SemesterId] int NOT NULL,
    [CreatedBy] int NOT NULL,
    [TemplateName] nvarchar(255) NOT NULL,
    [TemplateUrl] nvarchar(max) NOT NULL,
    [FileResourceId] nvarchar(255) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__ProjectT__F87ADD2755CD81C4] PRIMARY KEY ([TemplateId]),
    CONSTRAINT [FK_Template_Semester] FOREIGN KEY ([SemesterId]) REFERENCES [Semesters] ([SemesterId])
);
GO

CREATE INDEX [IX_ProjectSubmissions_ProjectId] ON [ProjectSubmissions] ([ProjectId]);
GO

CREATE INDEX [IX_ProjectTemplates_SemesterId] ON [ProjectTemplates] ([SemesterId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260125053737_AddProjectSubmissionTable', N'8.0.11');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Users] ADD [AvatarUrl] nvarchar(max) NULL;
GO

ALTER TABLE [Users] ADD [Bio] nvarchar(max) NULL;
GO

ALTER TABLE [Users] ADD [PhoneNumber] nvarchar(max) NULL;
GO

ALTER TABLE [ProjectSubmissions] ADD [TeacherComment] nvarchar(max) NULL;
GO

CREATE TABLE [PasswordResetOtp] (
    [Id] uniqueidentifier NOT NULL DEFAULT ((newid())),
    [Email] nvarchar(255) NOT NULL,
    [OtpCode] nvarchar(10) NOT NULL,
    [ExpiredAt] datetime2 NOT NULL,
    [IsUsed] bit NOT NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime2 NOT NULL DEFAULT ((sysdatetime())),
    [UsedAt] datetime2 NULL,
    CONSTRAINT [PK_PasswordResetOtp] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260303083701_AddTeacherCommentToProjectSubmission', N'8.0.11');
GO

COMMIT;
GO

