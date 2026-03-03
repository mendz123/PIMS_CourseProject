using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Council;

public class UpdateCouncilDto
{
    [MaxLength(100)]
    public string? CouncilName { get; set; }

    /// <summary>
    /// If provided, the council members will be synchronized with this list
    /// (old members removed, new ones added). If null, members remain unchanged.
    /// </summary>
    public List<int>? MemberUserIds { get; set; }
}
