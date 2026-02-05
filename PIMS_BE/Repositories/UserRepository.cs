using Microsoft.EntityFrameworkCore;
using System.Linq;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdWithDetailsAsync(int id);
    Task<PagedResult<User>> GetUsersPagedAsync(int pageIndex, int pageSize, string? search, string? role, string? status);
}

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(PimsDbContext context) : base(context)
    {
    }
    public async Task<User?> GetByIdWithDetailsAsync(int id)
{
    return await _dbSet
        .Include(u => u.Role)
        .Include(u => u.Status)
        .FirstOrDefaultAsync(u => u.UserId == id);
}

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.Status)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<PagedResult<User>> GetUsersPagedAsync(
        int pageIndex,
        int pageSize,
        string? search,
        string? role,
        string? status)
    {
        IQueryable<User> query = _dbSet
            .AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.Status);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u =>
                EF.Functions.Like(u.FullName, $"%{search}%") ||
                EF.Functions.Like(u.Email, $"%{search}%") ||
                EF.Functions.Like(u.PhoneNumber, $"%{search}%") ||
                EF.Functions.Like(u.Role.RoleName, $"%{search}%") ||
                EF.Functions.Like(u.Status.StatusName, $"%{search}%")
            );
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(u => u.Role != null && u.Role.RoleName == role);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(u => u.Status != null && u.Status.StatusName == status);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(u => u.UserId)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<User>
        {
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalCount = totalCount,
            Items = items
        };
    }


}
