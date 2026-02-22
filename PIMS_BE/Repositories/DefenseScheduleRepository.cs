using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IDefenseScheduleRepository : IGenericRepository<Models.DefenseSchedule>
{
    Task<IEnumerable<Models.DefenseSchedule>> GetByCouncilAsync(int councilId);
    Task<IEnumerable<Models.DefenseSchedule>> GetBySemesterAsync(int semesterId);
    Task<Models.DefenseSchedule?> GetWithDetailsAsync(int scheduleId);
    /// <summary>Kiểm tra trùng giờ trong cùng hội đồng cùng ngày</summary>
    Task<bool> IsTimeConflictAsync(int councilId, DateOnly date,
        TimeOnly start, TimeOnly end, int? excludeScheduleId = null);
}

public class DefenseScheduleRepository
    : GenericRepository<Models.DefenseSchedule>, IDefenseScheduleRepository
{
    public DefenseScheduleRepository(PimsDbContext context) : base(context) { }

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
}
