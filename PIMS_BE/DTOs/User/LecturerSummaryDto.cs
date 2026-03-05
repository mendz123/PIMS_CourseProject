namespace PIMS_BE.DTOs.User;

public class LecturerSummaryDto
{
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string Email { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public List<LecturerMentoringGroupDto> MentoringGroups { get; set; } = new();
    public List<LecturerCouncilGroupDto> CouncilGroups { get; set; } = new();
}

public class LecturerMentoringGroupDto
{
    public int GroupId { get; set; }
    public string? GroupName { get; set; }
    public int SemesterId { get; set; }
    public string? SemesterName { get; set; }
}

public class LecturerCouncilGroupDto
{
    public int GroupId { get; set; }
    public string? GroupName { get; set; }
    public int CouncilId { get; set; }
    public string? CouncilName { get; set; }
    public string? SemesterName { get; set; }
    public DateOnly? DefenseDate { get; set; }
}
