using Microsoft.EntityFrameworkCore;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.DTOs.User;
using PIMS_BE.Models;
using PIMS_BE.Services.Interfaces;
using PIMS_BE.Repositories;

namespace PIMS_BE.Services;

public class UserService : IUserService
{
    private readonly PimsDbContext _context;
    private readonly IUserRepository _userRepository;

    public UserService(PimsDbContext context, IUserRepository userRepository)
    {
        _context = context;
        _userRepository = userRepository;
    }
    
    public async Task<UserProfileDto> GetUserprofileAsync(int userId) {
        var user = await _userRepository.GetByIdWithDetailsAsync(userId);
        if(user == null) {
            throw new KeyNotFoundException("User not found");
        }
        return new UserProfileDto {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role != null ? user.Role.RoleName : null,
            AvatarUrl = user.AvatarUrl,
            PhoneNumber = user.PhoneNumber,
            Bio = user.Bio,
            Status = user.Status != null ? user.Status.StatusName : null,
        };
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
}
