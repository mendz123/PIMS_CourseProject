using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.Models;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

/// <summary>
/// Service xử lý authentication với JWT Access Token + Refresh Token
/// </summary>
public class AuthService : IAuthService
{
    private readonly PimsProjectContext _context;
    private readonly IConfiguration _configuration;

    // Token expiration times
    private const int ACCESS_TOKEN_EXPIRATION_MINUTES = 15;
    private const int REFRESH_TOKEN_EXPIRATION_DAYS = 7;

    public AuthService(PimsProjectContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        // Tìm user bằng email
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Status)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            return null;

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        // Check user status
        if (user.Status?.StatusName == "INACTIVE" || user.Status?.StatusName == "BANNED")
            return null;

        // Generate tokens
        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
            return null;

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Get default role (STUDENT) and status (ACTIVE)
        var studentRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "STUDENT");
        var activeStatus = await _context.UserStatuses.FirstOrDefaultAsync(s => s.StatusName == "ACTIVE");

        // Create new user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            RoleId = studentRole?.RoleId,
            StatusId = activeStatus?.StatusId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Reload user with Role
        user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == user.UserId);

        return await GenerateAuthResponseAsync(user!);
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        // Tìm refresh token trong database
        var storedToken = await _context.RefreshTokens
            .Include(t => t.User)
                .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(t => t.Token == refreshToken);

        // Validate token
        if (storedToken == null || !storedToken.IsActive)
            return null;

        // Revoke old token
        storedToken.IsRevoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;

        // Generate new tokens
        var response = await GenerateAuthResponseAsync(storedToken.User);

        await _context.SaveChangesAsync();

        return response;
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken);

        if (storedToken == null || storedToken.IsRevoked)
            return false;

        storedToken.IsRevoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<UserInfo?> GetUserInfoAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

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

    // === PRIVATE METHODS ===

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshToken = await GenerateRefreshTokenAsync(user.UserId);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(ACCESS_TOKEN_EXPIRATION_MINUTES),
            RefreshTokenExpiresAt = refreshToken.ExpiresAt,
            User = new UserInfo
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role?.RoleName
            }
        };
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

    private async Task<RefreshToken> GenerateRefreshTokenAsync(int userId)
    {
        // Generate random token
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var tokenString = Convert.ToBase64String(randomBytes);

        var refreshToken = new RefreshToken
        {
            Token = tokenString,
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(REFRESH_TOKEN_EXPIRATION_DAYS),
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }
}
