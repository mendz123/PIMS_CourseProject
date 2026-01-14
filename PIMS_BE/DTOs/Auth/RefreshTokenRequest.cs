using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Auth;

/// <summary>
/// Request body for refreshing access token
/// </summary>
public class RefreshTokenRequest
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = null!;
}
