using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IDefenseScheduleRepository : IGenericRepository<Models.DefenseSchedule>
{
    Task<IEnumerable<Models.DefenseSchedule>> GetAllWithDetailsAsync();
    Task<IEnumerable<Models.DefenseSchedule>> GetByCouncilAsync(int councilId);
    Task<IEnumerable<Models.DefenseSchedule>> GetBySemesterAsync(int semesterId);
    Task<Models.DefenseSchedule?> GetWithDetailsAsync(int scheduleId);
    /// <summary>Check time conflict for same council on same day</summary>
    Task<bool> IsTimeConflictAsync(int councilId, DateOnly date,
        TimeOnly start, TimeOnly end, int? excludeScheduleId = null);
    /// <summary>Check time conflict for a room on same day (TC-DS-06/TC-DS-10)</summary>
    Task<bool> IsRoomTimeConflictAsync(int roomId, DateOnly date,
        TimeOnly start, TimeOnly end, int? excludeScheduleId = null);
    /// <summary>Return the scheduleId that uses this room (for TC-ROOM-07 error message)</summary>
    Task<int?> GetScheduleIdByRoomAsync(int roomId);
}

public class DefenseScheduleRepository
    : GenericRepository<Models.DefenseSchedule>, IDefenseScheduleRepository
{
    public DefenseScheduleRepository(PimsDbContext context) : base(context) { }

    public async Task<IEnumerable<Models.DefenseSchedule>> GetAllWithDetailsAsync()
        => await _context.DefenseSchedules
            .Include(ds => ds.Council)
            .Include(ds => ds.Group)
            .Include(ds => ds.Room)
            .OrderBy(ds => ds.DefenseDate)
            .ThenBy(ds => ds.StartTime)
            .ToListAsync();

    public async Task<IEnumerable<Models.DefenseSchedule>> GetByCouncilAsync(int councilId)
        => await _context.DefenseSchedules
            .Include(ds => ds.Council)
            .Include(ds => ds.Group)
            .Include(ds => ds.Room)
            .Where(ds => ds.CouncilId == councilId)
            .OrderBy(ds => ds.DefenseDate)
            .ThenBy(ds => ds.StartTime)
            .ToListAsync();

    public async Task<IEnumerable<Models.DefenseSchedule>> GetBySemesterAsync(int semesterId)
        => await _context.DefenseSchedules
            .Include(ds => ds.Council)
            .Include(ds => ds.Group)
            .Include(ds => ds.Room)
            .Where(ds => ds.Council.SemesterId == semesterId)
            .OrderBy(ds => ds.DefenseDate)
            .ThenBy(ds => ds.StartTime)
            .ToListAsync();

    public async Task<Models.DefenseSchedule?> GetWithDetailsAsync(int scheduleId)
        => await _context.DefenseSchedules
            .Include(ds => ds.Council)
            .Include(ds => ds.Group)
            .Include(ds => ds.Room)
            .FirstOrDefaultAsync(ds => ds.ScheduleId == scheduleId);

    public async Task<bool> IsTimeConflictAsync(
        int councilId, DateOnly date, TimeOnly start, TimeOnly end,
        int? excludeScheduleId = null)
    {
        return await _context.DefenseSchedules
            .AnyAsync(ds =>
                ds.CouncilId == councilId &&
                ds.DefenseDate == date &&
                (!excludeScheduleId.HasValue || ds.ScheduleId != excludeScheduleId.Value) &&
                ds.StartTime < end &&
                ds.EndTime   > start);
    }

    public async Task<bool> IsRoomTimeConflictAsync(
        int roomId, DateOnly date, TimeOnly start, TimeOnly end,
        int? excludeScheduleId = null)
    {
        return await _context.DefenseSchedules
            .AnyAsync(ds =>
                ds.RoomId == roomId &&
                ds.DefenseDate == date &&
                (!excludeScheduleId.HasValue || ds.ScheduleId != excludeScheduleId.Value) &&
                ds.StartTime < end &&
                ds.EndTime   > start);
    }

    public async Task<int?> GetScheduleIdByRoomAsync(int roomId)
    {
        var schedule = await _context.DefenseSchedules
            .Where(ds => ds.RoomId == roomId)
            .FirstOrDefaultAsync();
        return schedule?.ScheduleId;
    }
}
