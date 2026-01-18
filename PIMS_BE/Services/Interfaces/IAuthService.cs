using PIMS_BE.DTOs.Auth;

namespace PIMS_BE.Services.Interfaces;

/// <summary>
/// Interface cho Authentication service
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Đăng nhập user
    /// </summary>
    Task<AuthResponse?> LoginAsync(LoginRequest request);

    /// <summary>
    /// Đăng ký user mới
    /// </summary>
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Làm mới access token bằng refresh token
    /// </summary>
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Hủy refresh token (logout)
    /// </summary>
    Task<bool> RevokeTokenAsync(string refreshToken);

    /// <summary>
    /// Lấy thông tin user từ userId
    /// </summary>
    Task<UserInfo?> GetUserInfoAsync(int userId);
    Task<AuthResponse?> LoginWithGoogleAsync(string token);
}
