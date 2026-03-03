namespace PIMS_BE.DTOs.Assessment;

/// <summary>Kết quả trả về khi sinh viên xem tất cả assessment của bản thân</summary>
public class StudentMyAssessmentsDto
{
    // ---- Thông tin đề tài ----
    public int?    ProjectId          { get; set; }
    public string? ProjectTitle       { get; set; }
    public string? ProjectDescription { get; set; }

    // ---- Thông tin nhóm ----
    public int    GroupId   { get; set; }
    public string GroupName { get; set; } = string.Empty;

    // ---- Học kỳ ----
    public int    SemesterId   { get; set; }
    public string SemesterName { get; set; } = string.Empty;

    // ---- Danh sách assessment ----
    public List<StudentAssessmentItemDto> Assessments { get; set; } = new();
}
