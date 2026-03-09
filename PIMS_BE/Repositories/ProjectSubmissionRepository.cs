using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories
{
    // IProjectSubmissionRepository.cs
    public interface IProjectSubmissionRepository : IGenericRepository<ProjectSubmission>
    {
        Task<int> SaveAsync(); 
        Task<List<ProjectSubmission>> GetSubmissionsByGroupIdAsync(int groupId);
        Task<ProjectSubmission?> GetSubmissionByIdAsync(int submissionId);
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

        public async Task<List<ProjectSubmission>> GetSubmissionsByGroupIdAsync(int groupId)
        {
            return await _dbSet
                .Include(s => s.Assessment)
                .Include(s => s.Submitter)
                .Include(s => s.Group)
                .Where(s => s.GroupId == groupId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();
        }

        public async Task<ProjectSubmission?> GetSubmissionByIdAsync(int submissionId)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.SubmissionId == submissionId);
        }
    }
}
