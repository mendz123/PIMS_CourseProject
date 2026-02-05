using Microsoft.EntityFrameworkCore;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.DTOs.User;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class UserService : IUserService
{
    private readonly PimsDbContext _context;
    private readonly IUserRepository _userRepository;
    private readonly ICloudinaryService _cloudinaryService;

    public UserService(PimsDbContext context, IUserRepository userRepository, ICloudinaryService cloudinaryService)
    {
        _context = context;
        _userRepository = userRepository;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<List<UserInfo>> GetTeachersAsync()
    {
        // 2 is TEACHER
        var teachers = await _context.Users
            .Include(u => u.Role)
            .Where(u => u.RoleId == 2)
            .Select(u => new UserInfo
            {
                UserId = u.UserId,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role != null ? u.Role.RoleName : null
            })
            .ToListAsync();

        return teachers;
    }

    // update user by id
    public async Task<UserInfo> UpdateUserByIdAsync(UpdateProfileRequestDto request, int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return null;
        }

        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.Bio = request.Bio;

        if (request.Avatar != null)
        {
             var avatarUrl = await _cloudinaryService.UploadImageAsync(request.Avatar, "pims/avatars");
             user.AvatarUrl = avatarUrl;
        }

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();
        
        // Return updated UserInfo
        return new UserInfo 
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role != null ? user.Role.RoleName : null, // Assuming Role is loaded or not needed to be updated here
            PhoneNumber = user.PhoneNumber,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
            // Status mapping if needed, but not in DTO or UserInfo based on previous context 
        };
    }

    public async Task<UserInfo> ChangePasswordAsync(ChangePasswordRequestDto request, int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return null;
        }
        bool isLogginGoogle = BCrypt.Net.BCrypt.Verify("nopassword", user.PasswordHash);
        if (!isLogginGoogle)
        {
            if(!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Current password is incorrect");
            }
            if(request.CurrentPassword == request.NewPassword)
            {
                throw new ArgumentException("New password must be different from current password");
            }
            if(request.NewPassword != request.ConfirmPassword)
            {
                throw new ArgumentException("New password and confirm password do not match");
            }
            
        }
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();
        return new UserInfo 
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role != null ? user.Role.RoleName : null, // Assuming Role is loaded or not needed to be updated here
            PhoneNumber = user.PhoneNumber,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
        };
    }

    public async Task<PagedResult<UserInfo>> GetUsersPagedAsync(int pageIndex, int pageSize, string? search)
    {
        var pagedUsers = await _userRepository.GetUsersPagedAsync(pageIndex, pageSize, search);

        var pagedUserInfos = new PagedResult<UserInfo>
        {
            PageIndex = pagedUsers.PageIndex,
            PageSize = pagedUsers.PageSize,
            TotalCount = pagedUsers.TotalCount,
            Items = pagedUsers.Items.Select(u => new UserInfo
            {
                UserId = u.UserId,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role != null ? u.Role.RoleName : null,
                Status = u.Status != null ? u.Status.StatusName : null,
                PhoneNumber = u.PhoneNumber,
                Bio = u.Bio,
                AvatarUrl = u.AvatarUrl
            }).ToList()
        };

        return pagedUserInfos;
    }
}
