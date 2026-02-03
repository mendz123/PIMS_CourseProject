using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.Exceptions;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

/// <summary>
/// Authentication service implementation
/// Handles JWT Access Token + Refresh Token authentication flow
/// </summary>
public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetOtpRepository _otpRepository;
    private readonly IGenericRepository<Role> _roleRepository;
    private readonly IGenericRepository<UserStatus> _statusRepository;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    // Token expiration times
    private const int ACCESS_TOKEN_EXPIRATION_MINUTES = 15;
    private const int REFRESH_TOKEN_EXPIRATION_DAYS = 7;
    private const int EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS = 24;

    public AuthService(
        IConfiguration configuration, 
        IUserRepository userRepository, 
        IPasswordResetOtpRepository otpRepository,
        IGenericRepository<Role> roleRepository,
        IGenericRepository<UserStatus> statusRepository,
        IGoogleAuthService googleAuthService,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _roleRepository = roleRepository;
        _statusRepository = statusRepository;
        _configuration = configuration;
        _googleAuthService = googleAuthService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            throw new AuthenticationException(
                "No account found with this email address. Please register first.",
                AuthErrorType.UserNotFound);
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new AuthenticationException(
                "Incorrect password. Please try again.",
                AuthErrorType.InvalidPassword);
        }

        // Check if email is not verified (INACTIVE status)
        if (user.Status?.StatusName == "INACTIVE")
        {
            throw new AuthenticationException(
                "Please verify your email address before logging in. Check your inbox for the verification link.",
                AuthErrorType.EmailNotVerified);
        }

        // Check if account is banned
        if (user.Status?.StatusName == "BANNED")
        {
            throw new AuthenticationException(
                "Your account has been suspended. Please contact support for assistance.",
                AuthErrorType.AccountBanned);
        }

        // Generate tokens
        return await GenerateAuthResponseAsync(user);
    }
    public async Task<AuthResponse?> LoginWithGoogleAsync(string token)
    {
        var googleUser = await _googleAuthService.VerifyGoogleTokenAsync(token);
        if (googleUser == null)
        {
            return null;
        }

        var email = googleUser.Email;
        var name = googleUser.Name;
        var user = await _userRepository.GetByEmailAsync(email);
        
        if (user != null)
        {
            // Google users are auto-verified, ensure status is ACTIVE
            if (user.Status?.StatusName == "INACTIVE")
            {
                var statuses = await _statusRepository.FindAsync(s => s.StatusName == "ACTIVE");
                var activeStatus = statuses.FirstOrDefault();
                user.StatusId = activeStatus?.StatusId ?? 1;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiresAt = null;
                await _userRepository.SaveChangesAsync();
            }
            return await GenerateAuthResponseAsync(user);
        } 
        else
        {
            // Create new user with ACTIVE status (Google verified)
            var roles = await _roleRepository.FindAsync(r => r.RoleName == "STUDENT");
            var studentRole = roles.FirstOrDefault();
            
            var statuses = await _statusRepository.FindAsync(s => s.StatusName == "ACTIVE");
            var activeStatus = statuses.FirstOrDefault();

            var newUser = new User
            {
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                FullName = name,
                RoleId = studentRole?.RoleId ?? 1,
                StatusId = activeStatus?.StatusId ?? 1, // ACTIVE - Google verified
                CreatedAt = DateTime.UtcNow,
                EmailVerificationToken = null // No verification needed for Google
            };

            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveChangesAsync();

            // Re-fetch to get Includes
            newUser = await _userRepository.GetByEmailAsync(email);

            // Send welcome email
            _ = Task.Run(async () =>
            {
                try { await _emailService.SendWelcomeEmailAsync(newUser!.Email, newUser.FullName ?? "User"); }
                catch { /* ignore */ }
            });

            return await GenerateAuthResponseAsync(newUser!);
        }
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            return null;

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Get default role (STUDENT) and status (INACTIVE - pending verification)
        var roles = await _roleRepository.FindAsync(r => r.RoleName == "STUDENT");
        var studentRole = roles.FirstOrDefault();
        
        var statuses = await _statusRepository.FindAsync(s => s.StatusName == "INACTIVE");
        var inactiveStatus = statuses.FirstOrDefault();

        // Generate verification token
        var verificationToken = GenerateVerificationToken();

        // Create new user with INACTIVE status
        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            RoleId = studentRole?.RoleId ?? 1,
            StatusId = inactiveStatus?.StatusId ?? 2, // INACTIVE until verified
            CreatedAt = DateTime.UtcNow,
            EmailVerificationToken = verificationToken,
            EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS)
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Reload user with Role for auth response
        user = await _userRepository.GetByEmailAsync(user.Email);

        // Send verification email
        var verificationLink = $"http://localhost:5172/api/Auth/verify-email?token={verificationToken}";
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendVerificationEmailAsync(user!.Email, user.FullName ?? "User", verificationLink);
                _logger.LogInformation("Verification email sent to {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", user!.Email);
            }
        });

        return await GenerateAuthResponseAsync(user!);
    }

    public Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        // Not supported in this version
        return Task.FromResult<AuthResponse?>(null);
    }

    public Task<bool> RevokeTokenAsync(string refreshToken)
    {
        // Not supported in this version
        return Task.FromResult(false);
    }

    public async Task<UserInfo?> GetUserInfoAsync(int userId)
    {
        var user = await _userRepository.GetByIdWithDetailsAsync(userId);

        if (user == null)
            return null;

        return new UserInfo
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role?.RoleName
        };
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var users = await _userRepository.FindAsync(u => u.EmailVerificationToken == token);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            _logger.LogWarning("Invalid verification token: {Token}", token);
            return false;
        }

        // Check if token expired
        if (user.EmailVerificationTokenExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Expired verification token for user: {Email}", user.Email);
            return false;
        }

        // Activate user
        var statuses = await _statusRepository.FindAsync(s => s.StatusName == "ACTIVE");
        var activeStatus = statuses.FirstOrDefault();
        
        user.StatusId = activeStatus?.StatusId ?? 1;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();

        _logger.LogInformation("Email verified successfully for: {Email}", user.Email);

        // Send welcome email after verification
        _ = Task.Run(async () =>
        {
            try { await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName ?? "User"); }
            catch { /* ignore */ }
        });

        return true;
    }

    public async Task<bool> ResendVerificationEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);

        if (user == null)
        {
            _logger.LogWarning("Resend verification - user not found: {Email}", email);
            return false;
        }

        // Check if already verified
        var statuses = await _statusRepository.FindAsync(s => s.StatusName == "ACTIVE");
        var activeStatus = statuses.FirstOrDefault();
        
        if (user.StatusId == activeStatus?.StatusId)
        {
            _logger.LogWarning("User already verified: {Email}", email);
            return false;
        }

        // Generate new token
        var verificationToken = GenerateVerificationToken();
        user.EmailVerificationToken = verificationToken;
        user.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS);

        await _userRepository.SaveChangesAsync();

        // Send verification email
        var verificationLink = $"http://localhost:5172/api/Auth/verify-email?token={verificationToken}";
        var result = await _emailService.SendVerificationEmailAsync(user.Email, user.FullName ?? "User", verificationLink);

        return result;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            return false;

        // Generate 6-digit OTP
        var otpCode = new Random().Next(100000, 999999).ToString();

        // Expire old ones
        await _otpRepository.ExpireOtpsByEmailAsync(request.Email);

        // Save to DB
        var otpEntry = new PasswordResetOtp
        {
            Email = request.Email,
            OtpCode = otpCode,
            ExpiredAt = DateTime.UtcNow.AddMinutes(10), // 10 minutes expiry
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _otpRepository.AddAsync(otpEntry);
        await _otpRepository.SaveChangesAsync();

        // Send email
        return await _emailService.SendPasswordResetOtpEmailAsync(request.Email, otpCode);
    }

    public async Task<bool> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var otpEntry = await _otpRepository.GetActiveOtpByEmailAsync(request.Email, request.OtpCode);

        if (otpEntry == null || otpEntry.ExpiredAt < DateTime.UtcNow)
            return false;

        return true;
    }

    public async Task<bool> ResetPasswordWithOtpAsync(ResetPasswordOtpRequest request)
    {
        // 1. Verify OTP one last time
        var otpEntry = await _otpRepository.GetActiveOtpByEmailAsync(request.Email, request.OtpCode);

        if (otpEntry == null || otpEntry.ExpiredAt < DateTime.UtcNow)
            return false;

        // 2. Find user
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            return false;

        // 3. Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        // 4. Mark OTP as used
        otpEntry.IsUsed = true;
        otpEntry.UsedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();
        return true;
    }

    private Task<AuthResponse> GenerateAuthResponseAsync(User user)
    {
        var accessToken = GenerateAccessToken(user);

        return Task.FromResult(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = string.Empty,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(ACCESS_TOKEN_EXPIRATION_MINUTES),
            RefreshTokenExpiresAt = DateTime.UtcNow.AddMinutes(ACCESS_TOKEN_EXPIRATION_MINUTES),
            User = new UserInfo
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role?.RoleName
            }
        });
    }

    private string GenerateAccessToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyAtLeast32Characters!";
        var issuer = jwtSettings["Issuer"] ?? "PIMS";
        var audience = jwtSettings["Audience"] ?? "PIMS-Users";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName ?? ""),
            new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "STUDENT"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(ACCESS_TOKEN_EXPIRATION_MINUTES),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateVerificationToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}
