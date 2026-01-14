using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Auth;

/// <summary>
/// Request body để làm mới access token
/// </summary>
public class RefreshTokenRequest
{
    [Required(ErrorMessage = "Refresh token là bắt buộc")]
    public string RefreshToken { get; set; } = null!;
}
