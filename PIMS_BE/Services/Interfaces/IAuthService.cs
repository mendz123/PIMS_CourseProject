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
    /// Lấy thông tin user từ userId
    /// </summary>
    Task<UserInfo?> GetUserInfoAsync(int userId);
    Task<AuthResponse?> LoginWithGoogleAsync(string token);
}
