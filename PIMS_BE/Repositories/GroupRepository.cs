using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IGroupRepository : IGenericRepository<Group>
{
}

public class GroupRepository : GenericRepository<Group>, IGroupRepository
{
    public GroupRepository(PimsDbContext context) : base(context)
    {
    }
}
