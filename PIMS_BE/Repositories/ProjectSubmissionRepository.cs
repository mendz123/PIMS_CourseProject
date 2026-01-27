using PIMS_BE.Models;

namespace PIMS_BE.Repositories
{
    // IProjectSubmissionRepository.cs
    public interface IProjectSubmissionRepository : IGenericRepository<ProjectSubmission> {
        Task<int> SaveAsync(); // Thêm phương thức này để thay thế cho CompleteAsync
          }

        // ProjectSubmissionRepository.cs
        public class ProjectSubmissionRepository : GenericRepository<ProjectSubmission>, IProjectSubmissionRepository
    {
        private readonly PimsDbContext _context;
        public ProjectSubmissionRepository(PimsDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
