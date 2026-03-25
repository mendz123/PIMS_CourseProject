using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Council;

public class CreateCouncilDto
{
    [Required(ErrorMessage = "Council name is required")]
    [MaxLength(100)]
    public string CouncilName { get; set; } = null!;



    /// <summary>List of UserId of teachers in the council</summary>
    [Required]
    [MinLength(1, ErrorMessage = "Council must have at least 1 member")]
    public List<int> MemberUserIds { get; set; } = new();
}
