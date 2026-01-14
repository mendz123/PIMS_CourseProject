using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IAssessmentSubmissionRepository : IGenericRepository<AssessmentSubmission>
{
}

public class AssessmentSubmissionRepository : GenericRepository<AssessmentSubmission>, IAssessmentSubmissionRepository
{
    public AssessmentSubmissionRepository(PimsProjectContext context) : base(context)
    {
    }
}
