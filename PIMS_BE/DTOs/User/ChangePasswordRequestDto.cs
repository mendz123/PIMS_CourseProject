
public class ChangePasswordRequestDto
{
    public string? CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
    public required string ConfirmPassword { get; set; }
}