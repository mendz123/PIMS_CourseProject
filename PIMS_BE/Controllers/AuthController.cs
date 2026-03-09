using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.Exceptions;
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
        // SetTokenCookies(result); // Don't login automatically

        // Return only user info (tokens are stored in HttpOnly cookies)
        var response = new LoginResponse { User = result.User };
        return StatusCode(201, ApiResponse<LoginResponse>.Created(response, "Registration successful. Please check your email to verify your account."));
    }

    /// <summary>
    /// Login
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);

            if (result == null)
            {
                return Unauthorized(ApiResponse<LoginResponse>.Unauthorized("Login failed"));
            }

            // Set cookies
            SetTokenCookies(result);

            // Return only user info (tokens are stored in HttpOnly cookies)
            var response = new LoginResponse { User = result.User };
            return Ok(ApiResponse<LoginResponse>.Ok(response, "Login successful"));
        }
        catch (AuthenticationException ex)
        {
            // Return specific error message based on error type
            return ex.ErrorType switch
            {
                AuthErrorType.UserNotFound => NotFound(ApiResponse<LoginResponse>.NotFound(ex.Message)),
                AuthErrorType.InvalidPassword => Unauthorized(ApiResponse<LoginResponse>.Unauthorized(ex.Message)),
                AuthErrorType.EmailNotVerified => StatusCode(403, ApiResponse<LoginResponse>.Forbidden(ex.Message)),
                AuthErrorType.AccountBanned => StatusCode(403, ApiResponse<LoginResponse>.Forbidden(ex.Message)),
                _ => Unauthorized(ApiResponse<LoginResponse>.Unauthorized("Login failed"))
            };
        }
    }

    //Login with gg
    [HttpPost("login-with-google")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> LoginWithGoogle([FromBody] GoogleLoginRequest request) {
        var result = await _authService.LoginWithGoogleAsync(request.Token);
        if (result == null) {
            return Unauthorized(ApiResponse<LoginResponse>.Unauthorized("Invalid token"));
        } else {
            SetTokenCookies(result);
            var response = new LoginResponse {User = result.User};
            return Ok(ApiResponse<LoginResponse>.Ok(response, "Login successful"));
        }
    }

    /// <summary>
    /// Logout endpoint
    /// </summary>
    [HttpPost("logout")]
    public ActionResult<ApiResponse<bool>> Logout()
    {
        // Clear cookies
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

    /// <summary>
    /// Verify email address with token
    /// </summary>
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Verification token is required"));
        }

        var result = await _authService.VerifyEmailAsync(token);

        if (!result)
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Invalid or expired verification token"));
        }

        // Return HTML page for better user experience
        var html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Email Verified - PIMS</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        h1 { color: #667eea; }
        p { color: #666; }
        a { display: inline-block; margin-top: 20px; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>✅ Email Verified!</h1>
        <p>Your email has been successfully verified.<br>You can now log in to PIMS.</p>
        <a href='http://localhost:49684/login'>Go to Login</a>
    </div>
</body>
</html>";

        return Content(html, "text/html");
    }

    /// <summary>
    /// Resend verification email
    /// </summary>
    [HttpPost("resend-verification")]
    public async Task<ActionResult<ApiResponse<bool>>> ResendVerificationEmail([FromBody] ResendVerificationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Email))
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Email is required"));
        }

        var result = await _authService.ResendVerificationEmailAsync(request.Email);

        if (!result)
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Unable to resend verification email. User may not exist or is already verified."));
        }

        return Ok(ApiResponse<bool>.Ok(true, "Verification email sent successfully"));
    }

    /// <summary>
    /// Trigger forgot password - sends OTP code
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var result = await _authService.ForgotPasswordAsync(request);
        if (!result)
        {
            return NotFound(ApiResponse<bool>.NotFound("Email not found"));
        }
        return Ok(ApiResponse<bool>.Ok(true, "OTP code sent to your email"));
    }

    /// <summary>
    /// Verify OTP code
    /// </summary>
    [HttpPost("verify-otp")]
    public async Task<ActionResult<ApiResponse<bool>>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _authService.VerifyOtpAsync(request);
        if (!result)
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Invalid or expired OTP code"));
        }
        return Ok(ApiResponse<bool>.Ok(true, "OTP verified successfully"));
    }

    /// <summary>
    /// Reset password using OTP
    /// </summary>
    [HttpPost("reset-password-otp")]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPasswordWithOtp([FromBody] ResetPasswordOtpRequest request)
    {
        var result = await _authService.ResetPasswordWithOtpAsync(request);
        if (!result)
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Failed to reset password. OTP may be invalid or expired."));
        }
        return Ok(ApiResponse<bool>.Ok(true, "Password has been reset successfully"));
    }

    // === PRIVATE METHODS ===

    /// <summary>
    /// Set access token and refresh token to HttpOnly cookies
    /// </summary>
    private void SetTokenCookies(AuthResponse authResponse)
    {
        var isDevelopment = _configuration.GetValue<bool>("ASPNETCORE_ENVIRONMENT:Development", true);

        // Access token cookie - short lived
        Response.Cookies.Append(ACCESS_TOKEN_COOKIE, authResponse.AccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment, // Only HTTPS in production
            SameSite = SameSiteMode.Lax,
            Expires = authResponse.AccessTokenExpiresAt,
            Path = "/"
        });

        // Refresh token cookie - long lived (7 days)
        Response.Cookies.Append(REFRESH_TOKEN_COOKIE, authResponse.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment, // Only HTTPS in production
            SameSite = SameSiteMode.Lax,
            Expires = authResponse.RefreshTokenExpiresAt,
            Path = "/" // Send for all endpoints
        });
    }

    /// <summary>
    /// Clear cookies on logout
    /// </summary>
    private void ClearTokenCookies()
    {
        Response.Cookies.Delete(ACCESS_TOKEN_COOKIE, new CookieOptions { Path = "/" });
        Response.Cookies.Delete(REFRESH_TOKEN_COOKIE, new CookieOptions { Path = "/" });
    }


}
