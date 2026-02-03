CREATE DATABASE PIMS_Project;
GO
USE PIMS_Project;
GO
CREATE TABLE Roles (
    RoleId INT IDENTITY PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL
);

CREATE TABLE UserStatus (
    StatusId INT IDENTITY PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL
);

CREATE TABLE Semesters (
    SemesterId INT IDENTITY PRIMARY KEY,
    SemesterName NVARCHAR(50),
    StartDate DATE,
    EndDate DATE,
    MinGroupSize INT DEFAULT 1,
    MaxGroupSize INT DEFAULT 5,
    IsActive BIT DEFAULT 1
);

CREATE TABLE GroupStatus (
    StatusId INT IDENTITY PRIMARY KEY,
    StatusName NVARCHAR(50)
);

CREATE TABLE MentorRequestStatus (
    StatusId INT IDENTITY PRIMARY KEY,
    StatusName NVARCHAR(50)
);

CREATE TABLE ProjectStatus (
    StatusId INT IDENTITY PRIMARY KEY,
    StatusName NVARCHAR(50)
);

CREATE TABLE GroupMemberStatus (
    StatusId INT IDENTITY PRIMARY KEY,
    StatusName NVARCHAR(50)
);
CREATE TABLE Users (
    UserId INT IDENTITY PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255),
    FullName NVARCHAR(255),

    RoleId INT NOT NULL,      -- STUDENT / TEACHER / SUBJECT_HEAD / ADMIN
    StatusId INT NOT NULL,

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    CONSTRAINT FK_Users_Role 
        FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),

    CONSTRAINT FK_Users_Status 
        FOREIGN KEY (StatusId) REFERENCES UserStatus(StatusId)
);

CREATE TABLE Groups (
    GroupId INT IDENTITY PRIMARY KEY,
    GroupName NVARCHAR(255),
    SemesterId INT NOT NULL,
    LeaderId INT NOT NULL,
    MentorId INT NULL,
    StatusId INT NOT NULL,
    CONSTRAINT FK_Groups_Semester FOREIGN KEY (SemesterId) REFERENCES Semesters(SemesterId),
    CONSTRAINT FK_Groups_Leader FOREIGN KEY (LeaderId) REFERENCES Users(UserId),
    CONSTRAINT FK_Groups_Mentor FOREIGN KEY (MentorId) REFERENCES Users(UserId),
    CONSTRAINT FK_Groups_Status FOREIGN KEY (StatusId) REFERENCES GroupStatus(StatusId)
);

CREATE TABLE GroupMembers (
    GroupMemberId INT IDENTITY PRIMARY KEY,
    GroupId INT NOT NULL,
    UserId INT NOT NULL,
    StatusId INT NOT NULL,
    CONSTRAINT FK_GM_Group FOREIGN KEY (GroupId) REFERENCES Groups(GroupId),
    CONSTRAINT FK_GM_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_GM_Status FOREIGN KEY (StatusId) REFERENCES GroupMemberStatus(StatusId),
    CONSTRAINT UQ_User_OneGroup UNIQUE (UserId, GroupId)
);
CREATE TABLE MentorRequests (
    RequestId INT IDENTITY PRIMARY KEY,
    GroupId INT NOT NULL,
    UserId INT NOT NULL,
    Message NVARCHAR(MAX),
    StatusId INT DEFAULT 1,
    TeacherComment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_MR_Group FOREIGN KEY (GroupId) REFERENCES Groups(GroupId),
    CONSTRAINT FK_MR_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_MR_Status FOREIGN KEY (StatusId) REFERENCES MentorRequestStatus(StatusId)
);
CREATE TABLE Projects (
    ProjectId INT IDENTITY PRIMARY KEY,
    GroupId INT NOT NULL,
    Title NVARCHAR(255),
    Description NVARCHAR(MAX),
    StatusId INT NOT NULL,
    CONSTRAINT FK_Projects_Group FOREIGN KEY (GroupId) REFERENCES Groups(GroupId),
    CONSTRAINT FK_Projects_Status FOREIGN KEY (StatusId) REFERENCES ProjectStatus(StatusId)
);

CREATE TABLE Assessments (
    AssessmentId INT IDENTITY PRIMARY KEY,
    SemesterId INT NOT NULL,
    Title NVARCHAR(255),
    Weight DECIMAL(5,2),
    IsFinal BIT DEFAULT 0,
    IsLocked BIT DEFAULT 0, -- 🔒 khóa khi bắt đầu kỳ
    CreatedBy INT NOT NULL, -- Subject Head
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Assessment_Semester FOREIGN KEY (SemesterId) REFERENCES Semesters(SemesterId),
    CONSTRAINT FK_Assessment_Creator FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    CONSTRAINT UQ_Assessment_Semester UNIQUE (SemesterId, Title)
);


CREATE TABLE AssessmentCriteria (
    CriteriaId INT IDENTITY PRIMARY KEY,
    AssessmentId INT NOT NULL,
    CriteriaName NVARCHAR(255),
    Weight DECIMAL(5,2),
    CONSTRAINT FK_AC_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(AssessmentId),
    CONSTRAINT UQ_Assessment_Criteria UNIQUE (AssessmentId, CriteriaName)
);

CREATE TABLE Councils (
    CouncilId INT IDENTITY PRIMARY KEY,
    CouncilName NVARCHAR(100),
    SemesterId INT NOT NULL,
    CONSTRAINT FK_Council_Semester FOREIGN KEY (SemesterId) REFERENCES Semesters(SemesterId)
);

CREATE TABLE CouncilMembers (
    CouncilMemberId INT IDENTITY PRIMARY KEY,
    CouncilId INT NOT NULL,
    UserId INT NOT NULL,
    CONSTRAINT FK_CM_Council FOREIGN KEY (CouncilId) REFERENCES Councils(CouncilId),
    CONSTRAINT FK_CM_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT UQ_Council_Teacher UNIQUE (CouncilId, UserId)
);

CREATE TABLE DefenseSchedules (
    ScheduleId INT IDENTITY PRIMARY KEY,
    CouncilId INT NOT NULL,
    GroupId INT NOT NULL,
    DefenseDate DATE,
    StartTime TIME,
    EndTime TIME,
    Location NVARCHAR(255),
    Status NVARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT FK_DS_Council FOREIGN KEY (CouncilId) REFERENCES Councils(CouncilId),
    CONSTRAINT FK_DS_Group FOREIGN KEY (GroupId) REFERENCES Groups(GroupId),
    CONSTRAINT UQ_Council_Group UNIQUE (CouncilId, GroupId)
);
-- Mentor grading
CREATE TABLE CriteriaGrades (
    GradeId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    CriteriaId INT NOT NULL,
    TeacherId INT NOT NULL,
    Score DECIMAL(5,2),
    CONSTRAINT FK_CG_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_CG_Criteria FOREIGN KEY (CriteriaId) REFERENCES AssessmentCriteria(CriteriaId),
    CONSTRAINT FK_CG_Teacher FOREIGN KEY (TeacherId) REFERENCES Users(UserId),
    CONSTRAINT UQ_Mentor_Grade UNIQUE (UserId, CriteriaId)
);

-- Council grading (each member)
CREATE TABLE CouncilCriteriaGrades (
    GradeId INT IDENTITY PRIMARY KEY,

    CouncilId INT NOT NULL,
    GroupId INT NOT NULL,
    UserId INT NOT NULL,        -- sinh viên được chấm
    TeacherId INT NOT NULL,     -- giảng viên hội đồng
    CriteriaId INT NOT NULL,

    Score DECIMAL(5,2),

    CONSTRAINT FK_CCG_Council 
        FOREIGN KEY (CouncilId) REFERENCES Councils(CouncilId),

    CONSTRAINT FK_CCG_Group 
        FOREIGN KEY (GroupId) REFERENCES Groups(GroupId),

    CONSTRAINT FK_CCG_User 
        FOREIGN KEY (UserId) REFERENCES Users(UserId),

    CONSTRAINT FK_CCG_Teacher 
        FOREIGN KEY (TeacherId) REFERENCES Users(UserId),

    CONSTRAINT FK_CCG_Criteria 
        FOREIGN KEY (CriteriaId) REFERENCES AssessmentCriteria(CriteriaId),

    CONSTRAINT UQ_Council_Grade 
        UNIQUE (CouncilId, GroupId, UserId, TeacherId, CriteriaId)
);


CREATE TABLE AssessmentScores (
    ScoreId INT IDENTITY PRIMARY KEY,
    AssessmentId INT NOT NULL,
    UserId INT NOT NULL,
    Score DECIMAL(5,2),
    IsPassed BIT,
    CONSTRAINT FK_AS_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(AssessmentId),
    CONSTRAINT FK_AS_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT UQ_Assessment_User UNIQUE (AssessmentId, UserId)
);
CREATE TABLE Notifications (
    NotificationId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(255),
    Content NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Noti_User FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
CREATE TABLE StudentFinalResults (
    ResultId INT IDENTITY PRIMARY KEY,

    UserId INT NOT NULL,
    SemesterId INT NOT NULL,

    TotalScore DECIMAL(5,2),
    Grade NVARCHAR(5),        -- A, B+, C...
    IsPassed BIT,

    IsFinalized BIT DEFAULT 0, -- khóa điểm
    FinalizedAt DATETIME NULL,

    CONSTRAINT FK_SFR_User 
        FOREIGN KEY (UserId) REFERENCES Users(UserId),

    CONSTRAINT FK_SFR_Semester 
        FOREIGN KEY (SemesterId) REFERENCES Semesters(SemesterId),

    CONSTRAINT UQ_User_Semester 
        UNIQUE (UserId, SemesterId)
);

CREATE INDEX IX_Users_Status ON Users(StatusId);

CREATE INDEX IX_Groups_Semester ON Groups(SemesterId);
CREATE INDEX IX_Groups_Mentor ON Groups(MentorId);

CREATE INDEX IX_GroupMembers_Group ON GroupMembers(GroupId);
CREATE INDEX IX_GroupMembers_User ON GroupMembers(UserId);

CREATE INDEX IX_Defense_Group ON DefenseSchedules(GroupId);
CREATE INDEX IX_Defense_Council ON DefenseSchedules(CouncilId);

CREATE INDEX IX_CriteriaGrades_Criteria ON CriteriaGrades(CriteriaId);
CREATE INDEX IX_CouncilGrades_Group ON CouncilCriteriaGrades(GroupId);
INSERT INTO Roles (RoleName) VALUES
(N'STUDENT'),
(N'TEACHER'),
(N'SUBJECT_HEAD'),
(N'ADMIN');
INSERT INTO UserStatus (StatusName) VALUES
(N'ACTIVE'),
(N'INACTIVE'),
(N'BLOCKED');
INSERT INTO GroupStatus (StatusName) VALUES
(N'CREATED'),        -- vừa tạo
(N'FORMING'),        -- đang đủ người
(N'SUBMITTED'),      -- đã nộp đề tài
(N'APPROVED'),       -- mentor duyệt
(N'IN_PROGRESS'),   -- đang làm
(N'COMPLETED'),     -- hoàn thành
(N'CANCELLED');     -- huỷ
INSERT INTO GroupMemberStatus (StatusName) VALUES
(N'ACTIVE'),
(N'LEFT'),
(N'REMOVED');
INSERT INTO MentorRequestStatus (StatusName) VALUES
(N'PENDING'),
(N'APPROVED'),
(N'REJECTED'),
(N'CANCELLED');
INSERT INTO ProjectStatus (StatusName) VALUES
(N'DRAFT'),
(N'SUBMITTED'),
(N'APPROVED'),
(N'IN_PROGRESS'),
(N'COMPLETED'),
(N'REJECTED');
INSERT INTO Semesters (SemesterName, StartDate, EndDate, MinGroupSize, MaxGroupSize, IsActive)
VALUES
(N'Spring 2026', '2026-01-01', '2026-05-31', 4, 6, 1);

-- Lưu mẫu từ Trưởng bộ môn
CREATE TABLE ProjectTemplates (
    TemplateId INT IDENTITY PRIMARY KEY,
    SemesterId INT NOT NULL,
    CreatedBy INT NOT NULL,
    TemplateName NVARCHAR(255) NOT NULL,
    TemplateUrl NVARCHAR(MAX) NOT NULL,  
    FileResourceId NVARCHAR(255),        
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Template_Semester FOREIGN KEY (SemesterId) REFERENCES Semesters(SemesterId)
);


-- Lưu bài nộp của Sinh viên
CREATE TABLE ProjectSubmissions (
    SubmissionId INT IDENTITY PRIMARY KEY,
    ProjectId INT NOT NULL,
    SubmitterId INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    ReportUrl NVARCHAR(MAX) NOT NULL,
    FileResourceId NVARCHAR(255), 
    SubmittedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Submission_Project FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId)
);

-- 1. Thêm cột AssessmentId (Bắt buộc để biết nộp cho đợt nào: Iteration 1, 2, Final...)
ALTER TABLE ProjectSubmissions
ADD AssessmentId INT NOT NULL;

-- 2. Thêm cột GroupId (Để truy vấn nhanh nhóm nào nộp bài mà không cần JOIN xa)
ALTER TABLE ProjectSubmissions
ADD GroupId INT NOT NULL;

-- 3. Thêm cột Note (Cho phép sinh viên để lại lời nhắn khi nộp file)
ALTER TABLE ProjectSubmissions
ADD Note NVARCHAR(MAX) NULL;

-- 4. Tạo các khóa ngoại (Foreign Keys) để đảm bảo tính toàn vẹn
ALTER TABLE ProjectSubmissions
ADD CONSTRAINT FK_Submission_Assessment 
    FOREIGN KEY (AssessmentId) REFERENCES Assessments(AssessmentId);

ALTER TABLE ProjectSubmissions
ADD CONSTRAINT FK_Submission_Group 
    FOREIGN KEY (GroupId) REFERENCES Groups(GroupId);

ALTER TABLE ProjectSubmissions
ADD CONSTRAINT FK_Submission_Submitter 
    FOREIGN KEY (SubmitterId) REFERENCES Users(UserId);

	ALTER TABLE Assessments
ADD StartDate DATETIME NULL,
    Deadline DATETIME NULL,
    Description NVARCHAR(MAX) NULL;