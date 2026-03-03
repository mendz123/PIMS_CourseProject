using PIMS_BE.DTOs.Council;

namespace PIMS_BE.Services.Interfaces;

public interface ICouncilService
{
    Task<IEnumerable<CouncilDto>> GetAllAsync(int? semesterId);
    Task<CouncilDto?> GetByIdAsync(int id);
    Task<CouncilDto> CreateAsync(CreateCouncilDto dto);
    Task<CouncilDto> UpdateAsync(int id, UpdateCouncilDto dto);
}
