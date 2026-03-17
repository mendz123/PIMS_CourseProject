using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface ICriteriaGradeRepository : IGenericRepository<CriteriaGrade>
{
    Task<CriteriaGrade?> GetByUserAndCriteriaAsync(int userId, int criteriaId);
}

public class CriteriaGradeRepository : GenericRepository<CriteriaGrade>, ICriteriaGradeRepository
{
    public CriteriaGradeRepository(PimsDbContext context) : base(context) { }

    public async Task<CriteriaGrade?> GetByUserAndCriteriaAsync(int userId, int criteriaId)
    {
        return await _context.CriteriaGrades
            .FirstOrDefaultAsync(cg => cg.UserId == userId && cg.CriteriaId == criteriaId);
    }
}
