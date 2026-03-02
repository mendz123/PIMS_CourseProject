using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Semester;

public class CreateSemesterDto
{
    [Required(ErrorMessage = "Semester name is required")]
    [MaxLength(50)]
    public string SemesterName { get; set; } = null!;

    [Required(ErrorMessage = "Start date is required")]
    public DateOnly StartDate { get; set; }

    [Required(ErrorMessage = "End date is required")]
    public DateOnly EndDate { get; set; }

    [Range(1, 20, ErrorMessage = "MinGroupSize must be between 1 and 20")]
    public int MinGroupSize { get; set; } = 1;

    [Range(1, 20, ErrorMessage = "MaxGroupSize must be between 1 and 20")]
    public int MaxGroupSize { get; set; } = 5;

    public bool IsActive { get; set; } = false;
}
