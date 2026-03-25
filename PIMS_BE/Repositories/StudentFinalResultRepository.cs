using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IStudentFinalResultRepository : IGenericRepository<StudentFinalResult>
{
    Task<StudentFinalResult?> GetByUserAndSemesterAsync(int userId, int semesterId);
}

public class StudentFinalResultRepository : GenericRepository<StudentFinalResult>, IStudentFinalResultRepository
{
    public StudentFinalResultRepository(PimsDbContext context) : base(context) { }

    public async Task<StudentFinalResult?> GetByUserAndSemesterAsync(int userId, int semesterId)
    {
        return await _context.StudentFinalResults
            .FirstOrDefaultAsync(r => r.UserId == userId && r.SemesterId == semesterId);
    }
}
