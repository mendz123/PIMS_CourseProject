using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface ICouncilRepository : IGenericRepository<Council>
{
}

public class CouncilRepository : GenericRepository<Council>, ICouncilRepository
{
    public CouncilRepository(PimsDbContext context) : base(context)
    {
    }
}
