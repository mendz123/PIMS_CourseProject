using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
}

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(PimsProjectContext context) : base(context)
    {
    }
}
