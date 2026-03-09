using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public class PasswordResetOtpRepository : GenericRepository<PasswordResetOtp>, IPasswordResetOtpRepository
{
    public PasswordResetOtpRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<PasswordResetOtp?> GetActiveOtpByEmailAsync(string email, string otpCode)
    {
        return await _dbSet
            .Where(o => o.Email == email && o.OtpCode == otpCode && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task ExpireOtpsByEmailAsync(string email)
    {
        var oldOtps = await _dbSet
            .Where(o => o.Email == email && !o.IsUsed)
            .ToListAsync();

        foreach (var oldOtp in oldOtps)
        {
            oldOtp.IsUsed = true;
        }
    }
}
