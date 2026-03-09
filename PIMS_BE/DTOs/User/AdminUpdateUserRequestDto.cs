namespace PIMS_BE.DTOs.User;

public class AdminUpdateUserRequestDto
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? RoleName { get; set; }
    public string? StatusName { get; set; }
}
