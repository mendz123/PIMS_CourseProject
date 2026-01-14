using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>
/// Authentication controller with Cookie support
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    // Cookie names
    private const string ACCESS_TOKEN_COOKIE = "access_token";
    private const string REFRESH_TOKEN_COOKIE = "refresh_token";

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    /// <summary>
    /// Register a new account
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);

        if (result == null)
        {
            return BadRequest(ApiResponse<LoginResponse>.BadRequest("Email already exists or registration failed"));
        }

        // Set cookies
        SetTokenCookies(result);

        // Return only user info (tokens are stored in HttpOnly cookies)
        var response = new LoginResponse { User = result.User };
        return StatusCode(201, ApiResponse<LoginResponse>.Created(response, "Registration successful"));
    }

    /// <summary>
    /// Login
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (result == null)
        {
            return Unauthorized(ApiResponse<LoginResponse>.Unauthorized("Invalid email or password"));
        }

        // Set cookies
        SetTokenCookies(result);

        // Return only user info (tokens are stored in HttpOnly cookies)
        var response = new LoginResponse { User = result.User };
        return Ok(ApiResponse<LoginResponse>.Ok(response, "Login successful"));
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> RefreshToken([FromBody] RefreshTokenRequest? request = null)
    {
        // Get refresh token from cookie if not in body
        var refreshToken = request?.RefreshToken ?? Request.Cookies[REFRESH_TOKEN_COOKIE];

        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(ApiResponse<LoginResponse>.BadRequest("Refresh token is required"));
        }

        var result = await _authService.RefreshTokenAsync(refreshToken);

        if (result == null)
        {
            // Clear cookies if refresh token is invalid
            ClearTokenCookies();
            return Unauthorized(ApiResponse<LoginResponse>.Unauthorized("Invalid or expired refresh token"));
        }

        // Set new cookies
        SetTokenCookies(result);

        // Return only user info (tokens are stored in HttpOnly cookies)
        var response = new LoginResponse { User = result.User };
        return Ok(ApiResponse<LoginResponse>.Ok(response, "Token refreshed successfully"));
    }

    /// <summary>
    /// Logout - revoke refresh token
    /// </summary>
    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse<bool>>> Logout([FromBody] RefreshTokenRequest? request = null)
    {
        // Get refresh token from cookie if not in body
        var refreshToken = request?.RefreshToken ?? Request.Cookies[REFRESH_TOKEN_COOKIE];

        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.RevokeTokenAsync(refreshToken);
        }

        // Always clear cookies
        ClearTokenCookies();

        return Ok(ApiResponse<bool>.Ok(true, "Logout successful"));
    }

    /// <summary>
    /// Get current user info (requires authentication)
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserInfo>>> GetCurrentUser()
    {
        // Get userId from token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(ApiResponse<UserInfo>.Unauthorized("Invalid token"));
        }

        var userInfo = await _authService.GetUserInfoAsync(userId);

        if (userInfo == null)
        {
            return NotFound(ApiResponse<UserInfo>.NotFound("User not found"));
        }

        return Ok(ApiResponse<UserInfo>.Ok(userInfo, "User info retrieved successfully"));
    }

    // === PRIVATE METHODS ===

    /// <summary>
    /// Set access token and refresh token to HttpOnly cookies
    /// </summary>
    private void SetTokenCookies(AuthResponse authResponse)
    {
        var isProduction = !_configuration.GetValue<bool>("ASPNETCORE_ENVIRONMENT:Development", false);

        // Access token cookie - short lived
        Response.Cookies.Append(ACCESS_TOKEN_COOKIE, authResponse.AccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Only send over HTTPS
            SameSite = SameSiteMode.Strict,
            Expires = authResponse.AccessTokenExpiresAt,
            Path = "/"
        });

        // Refresh token cookie - long lived (7 ngày)
        Response.Cookies.Append(REFRESH_TOKEN_COOKIE, authResponse.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = authResponse.RefreshTokenExpiresAt,
            Path = "/api/auth" // Only send for auth endpoints
        });
    }

    /// <summary>
    /// Clear cookies on logout
    /// </summary>
    private void ClearTokenCookies()
    {
        Response.Cookies.Delete(ACCESS_TOKEN_COOKIE, new CookieOptions { Path = "/" });
        Response.Cookies.Delete(REFRESH_TOKEN_COOKIE, new CookieOptions { Path = "/api/auth" });
    }
}
