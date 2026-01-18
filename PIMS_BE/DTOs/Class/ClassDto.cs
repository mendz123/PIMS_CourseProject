namespace PIMS_BE.DTOs.Class;

public class ClassDto
{
    public int ClassId { get; set; }
    public string ClassCode { get; set; } = string.Empty;
    public string? Semester { get; set; }
    public string? Subject { get; set; }
    public string? TeacherName { get; set; }
    public int? TeacherId { get; set; }
}
