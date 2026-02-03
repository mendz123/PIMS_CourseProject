using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Auth;

/// <summary>
/// Request to send OTP code to email
/// </summary>
public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}

/// <summary>
/// Request to verify OTP code
/// </summary>
public class VerifyOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [StringLength(10, MinimumLength = 4)]
    public string OtpCode { get; set; } = null!;
}

/// <summary>
/// Request to reset password with a valid OTP
/// </summary>
public class ResetPasswordOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [StringLength(10, MinimumLength = 4)]
    public string OtpCode { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = null!;

    [Required]
    [Compare("NewPassword")]
    public string ConfirmPassword { get; set; } = null!;
}
