using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IPasswordResetOtpRepository : IGenericRepository<PasswordResetOtp>
{
    Task<PasswordResetOtp?> GetActiveOtpByEmailAsync(string email, string otpCode);
    Task ExpireOtpsByEmailAsync(string email);
}
