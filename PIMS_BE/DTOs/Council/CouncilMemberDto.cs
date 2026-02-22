namespace PIMS_BE.DTOs.Council;

public class CouncilMemberDto
{
    public int    UserId   { get; set; }
    public string FullName { get; set; } = null!;
    public string Email    { get; set; } = null!;
}
