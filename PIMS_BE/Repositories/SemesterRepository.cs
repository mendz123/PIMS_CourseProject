using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface ISemesterRepository : IGenericRepository<Semester>
{
}

public class SemesterRepository : GenericRepository<Semester>, ISemesterRepository
{
    public SemesterRepository(PimsProjectContext context) : base(context)
    {
    }
}
