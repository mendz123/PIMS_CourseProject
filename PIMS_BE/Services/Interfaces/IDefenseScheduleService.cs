using PIMS_BE.DTOs.DefenseSchedule;

namespace PIMS_BE.Services.Interfaces;

public interface IDefenseScheduleService
{
    Task<IEnumerable<DefenseScheduleDto>> GetAllAsync(int? semesterId, int? councilId);
    Task<DefenseScheduleDto?> GetByIdAsync(int id);
    Task<IEnumerable<DefenseScheduleDto>> GetByTeacherAsync(int userId);
    Task<DefenseScheduleDto> CreateAsync(CreateDefenseScheduleDto dto);
    Task<DefenseScheduleDto> UpdateAsync(int scheduleId, UpdateDefenseScheduleDto dto);
    Task DeleteAsync(int scheduleId);
    Task<IEnumerable<DefenseScheduleDto>> BulkCreateAsync(BulkCreateDefenseScheduleDto dto);
    Task<DefenseScheduleDto> AssignRoomAsync(int scheduleId, AssignRoomDto dto);
    Task<IEnumerable<GroupInfoDto>> GetEligibleGroupsAsync(int semesterId);
}

public class GroupInfoDto
{
    public int GroupId { get; set; }
    public string? GroupName { get; set; }
    public int SemesterId { get; set; }
}

