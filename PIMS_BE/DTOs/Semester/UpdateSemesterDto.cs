using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Semester;

public class UpdateSemesterDto
{
    [MaxLength(50)]
    public string? SemesterName { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [Range(1, 20)]
    public int? MinGroupSize { get; set; }

    [Range(1, 20)]
    public int? MaxGroupSize { get; set; }

    public bool? IsActive { get; set; }
}
