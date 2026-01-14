using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IAssessmentRepository : IGenericRepository<Assessment>
{
}

public class AssessmentRepository : GenericRepository<Assessment>, IAssessmentRepository
{
    public AssessmentRepository(PimsProjectContext context) : base(context)
    {
    }
}
