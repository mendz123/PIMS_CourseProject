namespace PIMS_BE.DTOs.Assessment;

/// <summary>Thông tin 1 assessment mà sinh viên nhìn thấy</summary>
public class StudentAssessmentItemDto
{
    public int AssessmentId { get; set; }
    public string Title { get; set; } = string.Empty;

    /// <summary>Trọng số (%) của assessment này trong tổng điểm</summary>
    public decimal Weight { get; set; }

    public bool IsFinal { get; set; }
    public bool IsRetake { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
    public string? Description { get; set; }

    /// <summary>Điểm sinh viên đạt được (null nếu chưa chấm)</summary>
    public decimal? Score { get; set; }

    public bool? IsPassed { get; set; }

    /// <summary>Nhận xét của giảng viên sau khi chấm điểm</summary>
    public string? TeacherComment { get; set; }

    // ---- Assessment Criteria ----
    public List<AssessmentCriterionDto> Criteria { get; set; } = new();

    // ---- Chỉ có khi IsFinal == true ----
    public DateOnly?  DefenseDate      { get; set; }
    public TimeOnly?  DefenseStartTime  { get; set; }
    public TimeOnly?  DefenseEndTime    { get; set; }
    public int?       RoomId            { get; set; }
    public string?    RoomName          { get; set; }
    public string?    RoomLocation      { get; set; }
    public string?    DefenseStatus     { get; set; }
}
