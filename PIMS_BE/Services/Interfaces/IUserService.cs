using PIMS_BE.DTOs.Auth;
using PIMS_BE.DTOs.User;
using PIMS_BE.Models;

namespace PIMS_BE.Services.Interfaces;

public interface IUserService
{
    Task<List<UserInfo>> GetTeachersAsync();
    Task<UserInfo> UpdateUserByIdAsync(UpdateProfileRequestDto request, int id);
}
