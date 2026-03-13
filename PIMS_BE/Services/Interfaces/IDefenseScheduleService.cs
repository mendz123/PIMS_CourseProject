using PIMS_BE.DTOs.DefenseSchedule;

namespace PIMS_BE.Services.Interfaces;

public interface IDefenseScheduleService
{
    Task<IEnumerable<DefenseScheduleDto>> GetAllAsync(int? semesterId, int? councilId);
    Task<DefenseScheduleDto?> GetByIdAsync(int id);
    Task<IEnumerable<DefenseScheduleDto>> GetByTeacherAsync(int userId);
    Task<DefenseScheduleDto> CreateAsync(CreateDefenseScheduleDto dto);
    Task<IEnumerable<DefenseScheduleDto>> BulkCreateAsync(BulkCreateDefenseScheduleDto dto);
    Task<DefenseScheduleDto> AssignRoomAsync(int scheduleId, AssignRoomDto dto);
}
