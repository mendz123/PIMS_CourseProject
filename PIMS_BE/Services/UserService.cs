using Microsoft.EntityFrameworkCore;
using PIMS_BE.DTOs.Auth;
using PIMS_BE.Models;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class UserService : IUserService
{
    private readonly PimsDbContext _context;

    public UserService(PimsDbContext context)
    {
        _context = context;
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
