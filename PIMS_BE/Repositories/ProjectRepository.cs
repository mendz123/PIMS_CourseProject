using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IProjectRepository : IGenericRepository<Project>
{
    Task<Project?> GetProjectByGroupIdAsync(int groupId);
    Task<Project?> GetPendingTopicByGroupIdAsync(int groupId);
}

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
    public ProjectRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<Project?> GetProjectByGroupIdAsync(int groupId)
    {
        var approvedProject = await _dbSet.FirstOrDefaultAsync(p => p.GroupId == groupId && p.StatusId == 3);
        if (approvedProject != null) return approvedProject;

        return await _dbSet.Where(p => p.GroupId == groupId && p.StatusId == 1)
                           .OrderByDescending(p => p.ProjectId)
                           .FirstOrDefaultAsync();
    }

    public async Task<Project?> GetPendingTopicByGroupIdAsync(int groupId)
    {
        return await _dbSet.Where(p => p.GroupId == groupId && p.StatusId == 1)
                           .OrderByDescending(p => p.ProjectId)
                           .FirstOrDefaultAsync();
    }
}
