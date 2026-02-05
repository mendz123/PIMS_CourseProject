using Microsoft.EntityFrameworkCore;
using System.Linq;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdWithDetailsAsync(int id);
    Task<PagedResult<User>> GetUsersPagedAsync(int pageIndex, int pageSize);
}

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(PimsDbContext context) : base(context)
    {
    }
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.Status)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.Status)
            .FirstOrDefaultAsync(u => u.UserId == id);
    }
    public async Task<PagedResult<User>> GetUsersPagedAsync(int pageIndex, int pageSize)
    {
        var query = _dbSet
            .Include(u => u.Role)
            .Include(u => u.Status)
            .AsNoTracking();

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
