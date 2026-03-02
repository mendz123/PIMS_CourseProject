using PIMS_BE.DTOs.Semester;

namespace PIMS_BE.Services.Interfaces;

public interface ISemesterService
{
    Task<IEnumerable<SemesterDto>> GetAllSemestersAsync();
    Task<SemesterDto?> GetByIdAsync(int id);
    Task<SemesterDto?> GetActiveSemesterAsync();
    Task<SemesterDto> CreateSemesterAsync(CreateSemesterDto dto);
    Task<SemesterDto> UpdateSemesterAsync(int id, UpdateSemesterDto dto);
    Task DeleteSemesterAsync(int id);
}
