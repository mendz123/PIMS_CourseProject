namespace PIMS_BE.DTOs.User;

public class UserProfileDto {
    public int UserId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }    
}