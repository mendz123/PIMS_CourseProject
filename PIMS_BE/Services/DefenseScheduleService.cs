using PIMS_BE.DTOs.DefenseSchedule;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class DefenseScheduleService : IDefenseScheduleService
{
    private readonly IDefenseScheduleRepository _scheduleRepo;
    private readonly ICouncilRepository         _councilRepo;
    private readonly IGroupRepository           _groupRepo;
    private readonly IRoomRepository            _roomRepo;

    public DefenseScheduleService(
        IDefenseScheduleRepository scheduleRepo,
        ICouncilRepository         councilRepo,
        IGroupRepository           groupRepo,
        IRoomRepository            roomRepo)
    {
        _scheduleRepo = scheduleRepo;
        _councilRepo  = councilRepo;
        _groupRepo    = groupRepo;
        _roomRepo     = roomRepo;
    }

    public async Task<IEnumerable<DefenseScheduleDto>> GetAllAsync(int? semesterId, int? councilId)
    {
        IEnumerable<DefenseSchedule> schedules;

        if (councilId.HasValue)
            schedules = await _scheduleRepo.GetByCouncilAsync(councilId.Value);
        else if (semesterId.HasValue)
            schedules = await _scheduleRepo.GetBySemesterAsync(semesterId.Value);
        else
            schedules = await _scheduleRepo.GetAllAsync();

        return schedules.Select(MapToDto);
    }

    public async Task<DefenseScheduleDto?> GetByIdAsync(int id)
    {
        var schedule = await _scheduleRepo.GetWithDetailsAsync(id);
        return schedule == null ? null : MapToDto(schedule);
    }

    public async Task<DefenseScheduleDto> CreateAsync(CreateDefenseScheduleDto dto)
    {
        if (dto.EndTime <= dto.StartTime)
            throw new ArgumentException("EndTime must be after StartTime");

        // Validate Council
        _ = await _councilRepo.GetByIdAsync(dto.CouncilId)
            ?? throw new KeyNotFoundException($"Council {dto.CouncilId} not found");

        // Validate Group
        _ = await _groupRepo.GetByIdAsync(dto.GroupId)
            ?? throw new KeyNotFoundException($"Group {dto.GroupId} not found");

        // Validate Room nếu có
        if (dto.RoomId.HasValue)
            _ = await _roomRepo.GetByIdAsync(dto.RoomId.Value)
                ?? throw new KeyNotFoundException($"Room {dto.RoomId} not found");

        // Kiểm tra trùng giờ trong cùng hội đồng + ngày
        bool hasConflict = await _scheduleRepo.IsTimeConflictAsync(
            dto.CouncilId, dto.DefenseDate, dto.StartTime, dto.EndTime);
        if (hasConflict)
            throw new InvalidOperationException(
                "Time conflict: the council already has a defense session in this time slot");

        // Check room time conflict if roomId is provided (TC-DS-06)
        if (dto.RoomId.HasValue)
        {
            bool roomConflict = await _scheduleRepo.IsRoomTimeConflictAsync(
                dto.RoomId.Value, dto.DefenseDate, dto.StartTime, dto.EndTime);
            if (roomConflict)
                throw new InvalidOperationException(
                    $"Time conflict: room is already booked for another schedule overlapping this time");
        }

        var schedule = new DefenseSchedule
        {
            CouncilId   = dto.CouncilId,
            GroupId     = dto.GroupId,
            DefenseDate = dto.DefenseDate,
            StartTime   = dto.StartTime,
            EndTime     = dto.EndTime,
            RoomId      = dto.RoomId,
            Status      = "PENDING"
        };

        await _scheduleRepo.AddAsync(schedule);
        await _scheduleRepo.SaveChangesAsync();

        var created = await _scheduleRepo.GetWithDetailsAsync(schedule.ScheduleId);
        return MapToDto(created!);
    }

    public async Task<DefenseScheduleDto> AssignRoomAsync(int scheduleId, AssignRoomDto dto)
    {
        var schedule = await _scheduleRepo.GetWithDetailsAsync(scheduleId)
            ?? throw new KeyNotFoundException($"Schedule {scheduleId} not found");

        // Validate Room exists, then check time conflict (TC-DS-09 / TC-DS-10)
        if (dto.RoomId.HasValue)
        {
            _ = await _roomRepo.GetByIdAsync(dto.RoomId.Value)
                ?? throw new KeyNotFoundException($"Room {dto.RoomId} not found");

            bool roomConflict = await _scheduleRepo.IsRoomTimeConflictAsync(
                dto.RoomId.Value, schedule.DefenseDate, schedule.StartTime, schedule.EndTime,
                excludeScheduleId: scheduleId);
            if (roomConflict)
                throw new InvalidOperationException(
                    "Time conflict: room is already booked for another schedule overlapping this time");
        }

        schedule.RoomId = dto.RoomId;
        _scheduleRepo.Update(schedule);
        await _scheduleRepo.SaveChangesAsync();

        var updated = await _scheduleRepo.GetWithDetailsAsync(scheduleId);
        return MapToDto(updated!);
    }

    private static DefenseScheduleDto MapToDto(DefenseSchedule ds) => new()
    {
        ScheduleId  = ds.ScheduleId,
        CouncilId   = ds.CouncilId,
        CouncilName = ds.Council?.CouncilName ?? string.Empty,
        GroupId     = ds.GroupId,
        GroupName   = ds.Group?.GroupName    ?? string.Empty,
        DefenseDate = ds.DefenseDate,
        StartTime   = ds.StartTime,
        EndTime     = ds.EndTime,
        RoomId      = ds.RoomId,
        RoomName    = ds.Room?.RoomName,
        Location    = ds.Location,
        Status      = ds.Status
    };
}
