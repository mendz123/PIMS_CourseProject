namespace PIMS_BE.DTOs.Council;

public class CouncilDto
{
    public int    CouncilId   { get; set; }
    public string CouncilName { get; set; } = null!;
    public int    SemesterId   { get; set; }
    public string SemesterName { get; set; } = null!;
    public List<CouncilMemberDto> Members { get; set; } = new();
}
