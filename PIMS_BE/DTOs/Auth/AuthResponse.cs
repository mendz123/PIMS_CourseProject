namespace PIMS_BE.DTOs.Auth;

/// <summary>
/// Response trả về sau khi đăng nhập/đăng ký thành công
/// </summary>
public class AuthResponse
{
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime AccessTokenExpiresAt { get; set; }
    public DateTime RefreshTokenExpiresAt { get; set; }
    public UserInfo User { get; set; } = null!;
}

/// <summary>
/// Thông tin user trả về trong AuthResponse
/// </summary>
public class UserInfo
{
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
    public bool IsLoginGoogle { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Response trả về cho client (không bao gồm token vì đã lưu trong HttpOnly cookies)
/// </summary>
public class LoginResponse
{
    public UserInfo User { get; set; } = null!;
}
