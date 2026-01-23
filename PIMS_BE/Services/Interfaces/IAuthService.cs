using PIMS_BE.DTOs.Auth;

namespace PIMS_BE.Services.Interfaces;

/// <summary>
/// Interface for Authentication service
/// Handles user authentication, registration, and email verification
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Auth response with tokens, or null if failed</returns>
    Task<AuthResponse?> LoginAsync(LoginRequest request);

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="request">Registration details</param>
    /// <returns>Auth response with tokens, or null if email exists</returns>
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Get user information by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>User info or null if not found</returns>
    Task<UserInfo?> GetUserInfoAsync(int userId);

    /// <summary>
    /// Login or register user with Google OAuth token
    /// </summary>
    /// <param name="token">Google OAuth token</param>
    /// <returns>Auth response with tokens, or null if invalid token</returns>
    Task<AuthResponse?> LoginWithGoogleAsync(string token);

    /// <summary>
    /// Verify email with token
    /// </summary>
    /// <param name="token">Verification token from email</param>
    /// <returns>True if verified successfully</returns>
    Task<bool> VerifyEmailAsync(string token);

    /// <summary>
    /// Resend verification email
    /// </summary>
    /// <param name="email">User email</param>
    /// <returns>True if email sent successfully</returns>
    Task<bool> ResendVerificationEmailAsync(string email);
}
