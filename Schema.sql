CREATE DATABASE PIMS_Project;
GO
USE PIMS_Project;
GO

-- =============================================
-- 1. TẠO CÁC BẢNG DANH MỤC (LOOKUP TABLES)
-- =============================================
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL -- TEACHER, STUDENT, ADMIN
);

CREATE TABLE UserStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL -- ACTIVE, INACTIVE
);

CREATE TABLE Semesters (
    SemesterId INT PRIMARY KEY IDENTITY(1,1),
    SemesterName NVARCHAR(50) NOT NULL,
    StartDate DATE,
    EndDate DATE,
    IsActive BIT DEFAULT 1
);

CREATE TABLE ClassStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL -- SETUP, ONGOING, CLOSED
);

CREATE TABLE ClassStudentStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL -- INVITED, JOINED
);

CREATE TABLE GroupStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL -- ACTIVE, INVALID, DELETED
);

CREATE TABLE ProjectStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL -- DENIED, PENDING, APPROVED
);

CREATE TABLE CouncilStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL -- OPEN, CLOSED, RE-ASSIGNED
);
-- 1. Chèn Roles (Vai trò)
INSERT INTO Roles (RoleName) VALUES (N'ADMIN'), (N'TEACHER'), (N'STUDENT'), (N'SUBJECT HEAD');

-- 2. Chèn UserStatus (Trạng thái người dùng)
INSERT INTO UserStatus (StatusName) VALUES (N'ACTIVE'), (N'INACTIVE'), (N'BANNED');

-- 3. Chèn Semesters (Học kỳ)
INSERT INTO Semesters (SemesterName, StartDate, EndDate, IsActive) 
VALUES 
(N'Spring 2026', '2026-01-01', '2026-04-30', 1),
(N'Summer 2026', '2026-05-01', '2026-08-31', 0),
(N'Fall 2026', '2026-09-01', '2026-12-31', 0);

-- 4. Chèn ClassStatus (Trạng thái lớp học)
INSERT INTO ClassStatus (StatusName) VALUES (N'SETUP'), (N'ONGOING'), (N'CLOSED');

-- 5. Chèn ClassStudentStatus (Trạng thái sinh viên trong lớp)
INSERT INTO ClassStudentStatus (StatusName) VALUES (N'INVITED'), (N'JOINED'), (N'DROPPED');

-- 6. Chèn GroupStatus (Trạng thái nhóm)
INSERT INTO GroupStatus (StatusName) VALUES (N'ACTIVE'), (N'INVALID'), (N'DELETED');

-- 7. Chèn ProjectStatus (Trạng thái đề tài/đồ án)
INSERT INTO ProjectStatus (StatusName) VALUES (N'PENDING'), (N'APPROVED'), (N'DENIED');

-- 8. Chèn CouncilStatus (Trạng thái hội đồng chấm thi)
INSERT INTO CouncilStatus (StatusName) VALUES (N'OPEN'), (N'CLOSED'), (N'RE-ASSIGNED');

-- =============================================
-- 2. TẠO CÁC BẢNG CHÍNH (USERS, CLASSES, GROUPS)
-- =============================================
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName NVARCHAR(255),
    RoleId INT FOREIGN KEY REFERENCES Roles(RoleId),
    StatusId INT FOREIGN KEY REFERENCES UserStatus(StatusId),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Classes (
    ClassId INT PRIMARY KEY IDENTITY(1,1),
    ClassCode VARCHAR(50) UNIQUE NOT NULL,
    ClassName NVARCHAR(255),
    SemesterId INT FOREIGN KEY REFERENCES Semesters(SemesterId),
    TeacherId INT FOREIGN KEY REFERENCES Users(UserId), -- Giáo viên đứng lớp chính
    MinGroupSize INT DEFAULT 1,
    MaxGroupSize INT DEFAULT 1,
    GroupDeadline DATETIME,
    StatusId INT FOREIGN KEY REFERENCES ClassStatus(StatusId),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE ClassStudents (
    ClassStudentId INT PRIMARY KEY IDENTITY(1,1),
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    StudentEmail VARCHAR(100) NOT NULL,
    StudentId INT NULL FOREIGN KEY REFERENCES Users(UserId),
    StatusId INT FOREIGN KEY REFERENCES ClassStudentStatus(StatusId)
);

CREATE TABLE Groups (
    GroupId INT PRIMARY KEY IDENTITY(1,1),
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    GroupName NVARCHAR(255),
    LeaderId INT FOREIGN KEY REFERENCES Users(UserId),
    StatusId INT FOREIGN KEY REFERENCES GroupStatus(StatusId),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE GroupMembers (
    GroupMemberId INT PRIMARY KEY IDENTITY(1,1),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    JoinedAt DATETIME DEFAULT GETDATE(),
    -- Thêm các cột dưới đây:
    Status NVARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'LEFT', 'KICKED'
    LeftAt DATETIME NULL                   -- Để biết học sinh rời nhóm lúc nào
);
CREATE TABLE Projects (
    ProjectId INT PRIMARY KEY IDENTITY(1,1),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    Title NVARCHAR(255),
    Description NVARCHAR(MAX),
    StatusId INT FOREIGN KEY REFERENCES ProjectStatus(StatusId),
    TeacherNote NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);
-- =============================================
-- 3. QUẢN LÝ BÀI TẬP & TIÊU CHÍ (ASSESSMENTS & RUBRICS)
-- =============================================
CREATE TABLE Assessments (
    AssessmentId INT PRIMARY KEY IDENTITY(1,1),
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    Title NVARCHAR(255), 
    Weight FLOAT NOT NULL,           -- Ví dụ: 0.2 (20%)
    MinScoreToPass FLOAT DEFAULT 0,  -- Điểm liệt (nếu điểm < mức này thì trượt môn)
    IsFinal BIT DEFAULT 0,           -- 1: Chấm Hội đồng, 0: Bài thường
    DueDate DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Tiêu chí chấm (Mở rộng cho tất cả bài tập)
CREATE TABLE AssessmentCriteria (
    CriteriaId INT PRIMARY KEY IDENTITY(1,1),
    AssessmentId INT FOREIGN KEY REFERENCES Assessments(AssessmentId),
    CriteriaName NVARCHAR(255),      -- Ví dụ: Logic, Presentation, UI/UX...
    Weight FLOAT DEFAULT 1.0,        -- Trọng số trong bài đó (ví dụ: 0.4)
    MaxScore FLOAT DEFAULT 10
);

-- =============================================
-- 4. QUẢN LÝ HỘI ĐỒNG & NGƯỜI CHẤM (COUNCILS & GRADERS)
-- =============================================
CREATE TABLE Councils (
    CouncilId INT PRIMARY KEY IDENTITY(1,1),
    CouncilName NVARCHAR(100),
    AssessmentId INT FOREIGN KEY REFERENCES Assessments(AssessmentId),
    Round INT DEFAULT 1,             -- 1: Lần đầu, 2: Chấm lại
    StatusId INT FOREIGN KEY REFERENCES CouncilStatus(StatusId),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng trung gian gán Giáo viên vào bài chấm (Logic trọng tâm bạn cần)
CREATE TABLE Graders (
    GraderId INT PRIMARY KEY IDENTITY(1,1),
    AssessmentId INT FOREIGN KEY REFERENCES Assessments(AssessmentId),
    TeacherId INT FOREIGN KEY REFERENCES Users(UserId), -- Ai chấm?
    CouncilId INT NULL FOREIGN KEY REFERENCES Councils(CouncilId) -- NULL nếu là bài thường
);

-- =============================================
-- 5. NỘP BÀI & CHẤM ĐIỂM (SUBMISSIONS & GRADING)
-- =============================================
CREATE TABLE AssessmentSubmissions (
    SubmissionId INT PRIMARY KEY IDENTITY(1,1),
    AssessmentId INT FOREIGN KEY REFERENCES Assessments(AssessmentId),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    UploadedBy INT FOREIGN KEY REFERENCES Users(UserId),
    Description NVARCHAR(MAX),
    UploadedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE SubmissionFiles (
    FileId INT PRIMARY KEY IDENTITY(1,1),
    SubmissionId INT FOREIGN KEY REFERENCES AssessmentSubmissions(SubmissionId),
    FileName NVARCHAR(255),
    FileUrl VARCHAR(1000),
    FileType VARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE()
);
-- 1. Bảng lưu kết quả chấm của RIÊNG TỪNG GIÁO VIÊN (Dành cho mọi bài tập)
CREATE TABLE TeacherAssessments (
    TeacherAssessmentId INT PRIMARY KEY IDENTITY(1,1),
    GraderId INT FOREIGN KEY REFERENCES Graders(GraderId), -- Xác định ai chấm, bài nào
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    TeacherNote NVARCHAR(MAX), -- Nhận xét của giáo viên cho bài này
    RawScore FLOAT,            -- Điểm tổng mà GV này cho (tổng các tiêu chí)
    GradedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT UC_Grader_Student UNIQUE (GraderId, StudentId)
);
-- Bảng lưu điểm chi tiết theo tiêu chí cho từng Sinh viên
CREATE TABLE CriteriaGrades (
    GradeId INT PRIMARY KEY IDENTITY(1,1),
    GraderId INT FOREIGN KEY REFERENCES Graders(GraderId), -- Tham chiếu tới Người chấm
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    CriteriaId INT FOREIGN KEY REFERENCES AssessmentCriteria(CriteriaId),
    Score FLOAT CHECK (Score >= 0 AND Score <= 10),
    GradedAt DATETIME DEFAULT GETDATE(),
    -- Đảm bảo 1 giáo viên chỉ chấm 1 tiêu chí cho 1 SV 1 lần
    CONSTRAINT UC_Grader_Student_Criteria UNIQUE (GraderId, StudentId, CriteriaId)
);
CREATE TABLE AssessmentScores (
    ScoreId INT PRIMARY KEY IDENTITY(1,1),
    AssessmentId INT FOREIGN KEY REFERENCES Assessments(AssessmentId),
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    Score FLOAT, -- Điểm tổng kết cuối cùng của bài (ví dụ: trung bình hội đồng)
    IsPassed BIT, -- Tự động tính dựa trên MinScoreToPass của Assessment
    CouncilId INT NULL FOREIGN KEY REFERENCES Councils(CouncilId), -- NULL nếu bài thường
    GradedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT UC_Student_Assessment UNIQUE (StudentId, AssessmentId, CouncilId)
);

-- =============================================
-- 6. TỔNG KẾT & THÔNG BÁO
-- =============================================
CREATE TABLE StudentCourseResults (
    ResultId INT PRIMARY KEY IDENTITY(1,1),
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    FinalAverageScore FLOAT,         -- Tổng điểm trung bình trọng số
    CourseStatus NVARCHAR(20),       -- PASS, FAIL, RE-ASSESS
    Note NVARCHAR(MAX),              -- Lý do trượt (điểm liệt/điểm thấp)
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Notifications (
    NotificationId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(UserId),
    Title NVARCHAR(255),
    Content NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

ALTER TABLE Councils ADD 
    DefenseDate DATE,        -- Ngày bảo vệ
    StartTime TIME,          -- Giờ bắt đầu
    EndTime TIME,            -- Giờ kết thúc
    Location NVARCHAR(255);  -- Phòng họp (Phòng 202 hoặc link Google Meet)
CREATE TABLE DefenseSchedules (
    ScheduleId INT PRIMARY KEY IDENTITY(1,1),
    CouncilId INT FOREIGN KEY REFERENCES Councils(CouncilId),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    DefenseDate DATE,
    StartTime TIME,
    EndTime TIME,
    Location NVARCHAR(255),
    Status NVARCHAR(50) -- PENDING, ONGOING, FINISHED
); 
