
Users (
    UserId          INT PK,
    Email           VARCHAR UNIQUE NOT NULL,
    FullName        NVARCHAR,
    Role            ENUM('TEACHER', 'STUDENT'),
    Status          ENUM('ACTIVE', 'INACTIVE'),
    CreatedAt       DATETIME
)

Classes (
    ClassId         INT PK,
    ClassCode       VARCHAR UNIQUE,
    ClassName       NVARCHAR,
    TeacherId       INT FK -> Users(UserId),
    MinGroupSize    INT,
    MaxGroupSize    INT,
    GroupDeadline   DATETIME,
    Status          ENUM('SETUP', 'ONGOING', 'CLOSED'),
    CreatedAt       DATETIME
)

ClassStudents (
    ClassStudentId  INT PK,
    ClassId         INT FK -> Classes(ClassId),
    StudentEmail    VARCHAR,
    StudentId       INT FK -> Users(UserId) NULL,
    Status          ENUM('INVITED', 'JOINED')
)

Groups (
    GroupId         INT PK,
    ClassId         INT FK -> Classes(ClassId),
    GroupName       NVARCHAR,
    Status          ENUM('ACTIVE', 'INVALID', 'DELETED'),
    CreatedAt       DATETIME,
    leaderId        INT FK -> Users(UserId)
)

GroupMembers (
    GroupMemberId   INT PK,
    GroupId         INT FK -> Groups(GroupId),
    StudentId       INT FK -> Users(UserId),
    JoinedAt        DATETIME
)
Projects (
    ProjectId       INT PK,
    GroupId         INT FK -> Groups(GroupId),
    Title           NVARCHAR,
    Description     NVARCHAR,
    Status          ENUM('DRAFT', 'PENDING', 'APPROVED'),
    TeacherNote     NVARCHAR,
    CreatedAt       DATETIME,
    UpdatedAt       DATETIME
)

Assessments (
    AssessmentId    INT PK,
    ClassId         INT FK -> Classes(ClassId),
    Title           NVARCHAR,
    Description     NVARCHAR,
    MaxScore        FLOAT,
    DueDate         DATETIME,
    CreatedAt       DATETIME
)

AssessmentScores (
    ScoreId         INT PK,
    AssessmentId    INT FK -> Assessments(AssessmentId),
    StudentId       INT FK -> Users(UserId),
    GroupId         INT FK -> Groups(GroupId),
    Score           FLOAT,
    TeacherNote     NVARCHAR,
    GradedAt        DATETIME,

    UNIQUE (AssessmentId, StudentId)
)
AssessmentSubmissions (
    SubmissionId    INT PK,
    AssessmentId    INT FK -> Assessments(AssessmentId),
    GroupId         INT FK -> Groups(GroupId),
    UploadedBy      INT FK -> Users(UserId),
    FileUrl         VARCHAR,
    Description     NVARCHAR,
    UploadedAt      DATETIME
)

