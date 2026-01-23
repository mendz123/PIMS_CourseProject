using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Auth;

/// <summary>
/// Request to resend verification email
/// </summary>
public class ResendVerificationRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = null!;
}
