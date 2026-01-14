using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IClassRepository : IGenericRepository<Class>
{
}

public class ClassRepository : GenericRepository<Class>, IClassRepository
{
    public ClassRepository(PimsProjectContext context) : base(context)
    {
    }
}
