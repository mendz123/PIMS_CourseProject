using System.Threading.Tasks;
using System.Collections.Generic;
using PIMS_BE.DTOs.Semester;

namespace PIMS_BE.Services.Interfaces
{
    public interface ISemesterService
    {
        Task<IEnumerable<SemesterDto>> GetAllSemestersAsync();
    }
}
