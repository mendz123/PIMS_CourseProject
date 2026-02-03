using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IProjectRepository : IGenericRepository<Project>
{
    Task<Project?> GetProjectByGroupIdAsync(int groupId);
}

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
    public ProjectRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<Project?> GetProjectByGroupIdAsync(int groupId)
    {
        return await _dbSet.FirstOrDefaultAsync(p => p.GroupId == groupId);
    }
}
