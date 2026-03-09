using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface ISemesterRepository : IGenericRepository<Semester>
{
    Task<Semester?> GetWithDetailsAsync(int id);
}

public class SemesterRepository : GenericRepository<Semester>, ISemesterRepository
{
    public SemesterRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<Semester?> GetWithDetailsAsync(int id)
    {
        return await _context.Set<Semester>()
            .Include(s => s.Assessments)
            .Include(s => s.Councils)
            .Include(s => s.Groups)
            .Include(s => s.ProjectTemplates)
            .Include(s => s.StudentFinalResults)
            .FirstOrDefaultAsync(s => s.SemesterId == id);
    }
}
