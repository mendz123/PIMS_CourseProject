using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IDefenseScheduleRepository : IGenericRepository<Models.DefenseSchedule>
{
    Task<IEnumerable<Models.DefenseSchedule>> GetAllWithDetailsAsync();
    Task<IEnumerable<Models.DefenseSchedule>> GetByCouncilAsync(int councilId);
    Task<IEnumerable<Models.DefenseSchedule>> GetBySemesterAsync(int semesterId);
    Task<IEnumerable<Models.DefenseSchedule>> GetByTeacherAsync(int userId);
    Task<Models.DefenseSchedule?> GetWithDetailsAsync(int scheduleId);
    /// <summary>Check time conflict for same council on same day</summary>
    Task<bool> IsTimeConflictAsync(int councilId, DateOnly date,
        TimeOnly start, TimeOnly end, int? excludeScheduleId = null);
    /// <summary>Check time conflict for a room on same day (TC-DS-06/TC-DS-10)</summary>
    Task<bool> IsRoomTimeConflictAsync(int roomId, DateOnly date,
        TimeOnly start, TimeOnly end, int? excludeScheduleId = null);
    /// <summary>Return the scheduleId that uses this room (for TC-ROOM-07 error message)</summary>
    Task<int?> GetScheduleIdByRoomAsync(int roomId);
    /// <summary>Check if a (council, group, date) schedule already exists — allows retakes on different days</summary>
    Task<bool> ExistsByCouncilGroupAndDateAsync(int councilId, int groupId, DateOnly date, int? excludeScheduleId = null);
    /// <summary>Count how many defense schedules a group has in a given semester</summary>
    Task<int> CountByGroupInSemesterAsync(int groupId, int semesterId, int? excludeScheduleId = null);
    /// <summary>Get existing schedules for a group in a semester (ordered by date)</summary>
    Task<List<Models.DefenseSchedule>> GetSchedulesByGroupInSemesterAsync(int groupId, int semesterId);
    /// <summary>Get groups eligible for defense scheduling (not all members passed)</summary>
    Task<List<Group>> GetEligibleGroupsAsync(int semesterId);
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

    public async Task<IEnumerable<Models.DefenseSchedule>> GetByTeacherAsync(int userId)
        => await _context.DefenseSchedules
            .Include(ds => ds.Council)
                .ThenInclude(c => c.Semester)
            .Include(ds => ds.Council)
                .ThenInclude(c => c.CouncilMembers)
            .Include(ds => ds.Group)
            .Include(ds => ds.Room)
            .Where(ds => ds.Council.CouncilMembers.Any(m => m.UserId == userId))
            .OrderByDescending(ds => ds.Council.Semester.IsActive == true)
            .ThenByDescending(ds => ds.DefenseDate)
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

    public async Task<bool> ExistsByCouncilGroupAndDateAsync(int councilId, int groupId, DateOnly date, int? excludeScheduleId = null)
        => await _context.DefenseSchedules
            .AnyAsync(ds =>
                ds.CouncilId   == councilId &&
                ds.GroupId     == groupId   &&
                ds.DefenseDate == date      &&
                (!excludeScheduleId.HasValue || ds.ScheduleId != excludeScheduleId.Value));

    public async Task<int> CountByGroupInSemesterAsync(int groupId, int semesterId, int? excludeScheduleId = null)
    {
        return await _context.DefenseSchedules
            .Where(ds =>
                ds.GroupId == groupId &&
                ds.Council.SemesterId == semesterId &&
                (!excludeScheduleId.HasValue || ds.ScheduleId != excludeScheduleId.Value))
            .CountAsync();
    }

    public async Task<List<Models.DefenseSchedule>> GetSchedulesByGroupInSemesterAsync(int groupId, int semesterId)
    {
        return await _context.DefenseSchedules
            .Include(ds => ds.Council)
            .Include(ds => ds.Group)
            .Where(ds => ds.GroupId == groupId && ds.Council.SemesterId == semesterId)
            .OrderBy(ds => ds.DefenseDate)
            .ToListAsync();
    }

    public async Task<List<Group>> GetEligibleGroupsAsync(int semesterId)
    {
        // Get all groups in this semester
        // Exclude groups where ALL active members have IsPassed == true
        return await _context.Groups
            .Include(g => g.GroupMembers)
            .Where(g => g.SemesterId == semesterId)
            .Where(g => g.StatusId == 4)
            .Where(g =>
                // Nhóm phải có thành viên
                g.GroupMembers.Any() &&
                // Ít nhất 1 thành viên chưa pass (hoặc chưa có kết quả)
                g.GroupMembers.Any(gm =>
                    !_context.StudentFinalResults.Any(sfr =>
                        sfr.UserId == gm.UserId &&
                        sfr.SemesterId == semesterId &&
                        sfr.IsPassed == true
                    )
                )
            )
            .OrderBy(g => g.GroupId)
            .ToListAsync();
    }
}

