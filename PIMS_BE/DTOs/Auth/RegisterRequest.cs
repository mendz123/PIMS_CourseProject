using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Auth;

/// <summary>
/// Request body for registration
/// </summary>
public class RegisterRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = null!;

    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, ErrorMessage = "Full name cannot exceed 255 characters")]
    public string FullName { get; set; } = null!;
}
