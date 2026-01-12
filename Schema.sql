Create database PIMS_Project
use PIMS_Project

-- 1. Tạo các bảng danh mục (Lookup Tables)
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL -- TEACHER, STUDENT
);

CREATE TABLE UserStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL -- ACTIVE, INACTIVE
);
CREATE TABLE Semesters (
    SemesterId INT PRIMARY KEY IDENTITY(1,1),
    SemesterName NVARCHAR(50) NOT NULL, -- Ví dụ: Summer 2024, Fall 2024
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

-- 2. Tạo các bảng chính
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL, -- Lưu mật khẩu đã mã hóa
    FullName NVARCHAR(255),
    RoleId INT FOREIGN KEY REFERENCES Roles(RoleId),
    StatusId INT FOREIGN KEY REFERENCES UserStatus(StatusId),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Classes (
    ClassId INT PRIMARY KEY IDENTITY(1,1),
    ClassCode VARCHAR(50) UNIQUE NOT NULL,
    ClassName NVARCHAR(255),
    SemesterId INT FOREIGN KEY REFERENCES Semesters(SemesterId), -- Link to Semester
    TeacherId INT FOREIGN KEY REFERENCES Users(UserId),
    MinGroupSize INT DEFAULT 1,
    MaxGroupSize INT DEFAULT 1,
    GroupDeadline DATETIME,
    StatusId INT FOREIGN KEY REFERENCES ClassStatus(StatusId),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE ClassStudents (
    ClassStudentId INT PRIMARY KEY IDENTITY(1,1),
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    StudentEmail VARCHAR(100),
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    StatusId INT FOREIGN KEY REFERENCES ClassStudentStatus(StatusId)
);

CREATE TABLE Groups (
    GroupId INT PRIMARY KEY IDENTITY(1,1),
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    GroupName NVARCHAR(255),
    LeaderId INT FOREIGN KEY REFERENCES Users(UserId), -- Đã thêm LeaderId
    StatusId INT FOREIGN KEY REFERENCES GroupStatus(StatusId),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE GroupMembers (
    GroupMemberId INT PRIMARY KEY IDENTITY(1,1),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    JoinedAt DATETIME DEFAULT GETDATE()
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
CREATE TABLE Assessments (
    AssessmentId INT PRIMARY KEY IDENTITY(1,1),
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    Title NVARCHAR(255),
    Description NVARCHAR(MAX),
    MaxScore FLOAT DEFAULT 10,
    DueDate DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE()
);
-- 1. Bảng quản lý lần nộp bài (Chỉ chứa thông tin chung)
CREATE TABLE AssessmentSubmissions (
    SubmissionId INT PRIMARY KEY IDENTITY(1,1),
    AssessmentId INT FOREIGN KEY REFERENCES Assessments(AssessmentId),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    UploadedBy INT FOREIGN KEY REFERENCES Users(UserId),
    Description NVARCHAR(MAX),
    UploadedAt DATETIME DEFAULT GETDATE()
);

-- 2. Bảng quản lý danh sách các File đính kèm cho lần nộp đó
CREATE TABLE SubmissionFiles (
    FileId INT PRIMARY KEY IDENTITY(1,1),
    SubmissionId INT FOREIGN KEY REFERENCES AssessmentSubmissions(SubmissionId),
    FileName NVARCHAR(255), -- Tên file gốc (ví dụ: Bao_cao_nhom_1.pdf)
    FileUrl VARCHAR(1000),   -- Đường dẫn lưu trữ trên server/cloud
    FileType VARCHAR(50),   -- Loại file (.pdf, .zip, .docx)
    FileSize FLOAT,         -- Dung lượng file (KB/MB) để quản lý
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 5. Cập nhật bảng AssessmentScores: Thêm GradedBy (Audit Log - Point 5)
CREATE TABLE AssessmentScores (
    ScoreId INT PRIMARY KEY IDENTITY(1,1),
    AssessmentId INT FOREIGN KEY REFERENCES Assessments(AssessmentId),
    StudentId INT FOREIGN KEY REFERENCES Users(UserId),
    GroupId INT FOREIGN KEY REFERENCES Groups(GroupId),
    Score FLOAT,
    TeacherNote NVARCHAR(MAX),
    GradedBy INT FOREIGN KEY REFERENCES Users(UserId), -- Ai là người chấm điểm?
    GradedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT UC_Assessment_Student UNIQUE (AssessmentId, StudentId)
);

-- 3. Bảng thông báo (Notifications)
CREATE TABLE Notifications (
    NotificationId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(UserId), -- Người nhận
    Title NVARCHAR(255),
    Content NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);