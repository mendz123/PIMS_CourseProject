using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IProjectRepository : IGenericRepository<Project>
{
}

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
    public ProjectRepository(PimsDbContext context) : base(context)
    {
    }


}
