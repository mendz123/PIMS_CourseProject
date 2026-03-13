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
            schedules = await _scheduleRepo.GetAllWithDetailsAsync();

        return schedules.Select(MapToDto);
    }

    public async Task<DefenseScheduleDto?> GetByIdAsync(int id)
    {
        var schedule = await _scheduleRepo.GetWithDetailsAsync(id);
        return schedule == null ? null : MapToDto(schedule);
    }

    public async Task<IEnumerable<DefenseScheduleDto>> GetByTeacherAsync(int userId)
    {
        var schedules = await _scheduleRepo.GetByTeacherAsync(userId);
        return schedules.Select(MapToDto);
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

    public async Task<IEnumerable<DefenseScheduleDto>> BulkCreateAsync(BulkCreateDefenseScheduleDto dto)
    {
        if (dto.WindowEnd <= dto.WindowStart)
            throw new ArgumentException("WindowEnd must be after WindowStart");

        if (dto.GroupIds == null || dto.GroupIds.Count == 0)
            throw new ArgumentException("At least one group is required");

        // Loại bỏ trùng lặp, giữ thứ tự
        var groupIds = dto.GroupIds.Distinct().ToList();

        // Tính tổng số phút trong khung giờ
        int totalMinutes = (int)(dto.WindowEnd - dto.WindowStart).TotalMinutes;

        // Tính thời lượng mỗi slot
        int slotMinutes;
        if (dto.SlotMinutes.HasValue)
        {
            slotMinutes = dto.SlotMinutes.Value;
            if (slotMinutes <= 0)
                throw new ArgumentException("SlotMinutes must be greater than 0");
            if (slotMinutes * groupIds.Count > totalMinutes)
                throw new ArgumentException(
                    $"Not enough time: {groupIds.Count} groups × {slotMinutes} min = {slotMinutes * groupIds.Count} min, " +
                    $"but window is only {totalMinutes} min ({dto.WindowStart}–{dto.WindowEnd})");
        }
        else
        {
            if (totalMinutes % groupIds.Count != 0)
                throw new ArgumentException(
                    $"Cannot divide {totalMinutes} minutes evenly among {groupIds.Count} groups. " +
                    $"Please specify SlotMinutes explicitly.");
            slotMinutes = totalMinutes / groupIds.Count;
        }

        // Validate Council tồn tại
        _ = await _councilRepo.GetByIdAsync(dto.CouncilId)
            ?? throw new KeyNotFoundException($"Council {dto.CouncilId} not found");

        // Validate Room nếu có
        if (dto.RoomId.HasValue)
            _ = await _roomRepo.GetByIdAsync(dto.RoomId.Value)
                ?? throw new KeyNotFoundException($"Room {dto.RoomId} not found");

        // Chuẩn bị danh sách schedule để tạo
        var schedulesToAdd = new List<DefenseSchedule>();

        for (int i = 0; i < groupIds.Count; i++)
        {
            var groupId = groupIds[i];
            var slotStart = dto.WindowStart.AddMinutes(i * slotMinutes);
            var slotEnd   = dto.WindowStart.AddMinutes((i + 1) * slotMinutes);

            // Validate Group tồn tại
            _ = await _groupRepo.GetByIdAsync(groupId)
                ?? throw new KeyNotFoundException($"Group {groupId} not found");

            // Kiểm tra conflict hội đồng
            bool councilConflict = await _scheduleRepo.IsTimeConflictAsync(
                dto.CouncilId, dto.DefenseDate, slotStart, slotEnd);
            if (councilConflict)
                throw new InvalidOperationException(
                    $"Time conflict for group {groupId}: council already has a session at {slotStart}–{slotEnd}");

            // Kiểm tra conflict phòng
            if (dto.RoomId.HasValue)
            {
                bool roomConflict = await _scheduleRepo.IsRoomTimeConflictAsync(
                    dto.RoomId.Value, dto.DefenseDate, slotStart, slotEnd);
                if (roomConflict)
                    throw new InvalidOperationException(
                        $"Time conflict for group {groupId}: room is already booked at {slotStart}–{slotEnd}");
            }

            schedulesToAdd.Add(new DefenseSchedule
            {
                CouncilId   = dto.CouncilId,
                GroupId     = groupId,
                DefenseDate = dto.DefenseDate,
                StartTime   = slotStart,
                EndTime     = slotEnd,
                RoomId      = dto.RoomId,
                Status      = "PENDING"
            });
        }

        // Lưu tất cả 1 lần
        foreach (var s in schedulesToAdd)
            await _scheduleRepo.AddAsync(s);
        await _scheduleRepo.SaveChangesAsync();

        // Load lại đầy đủ thông tin để trả về
        var results = new List<DefenseScheduleDto>();
        foreach (var s in schedulesToAdd)
        {
            var full = await _scheduleRepo.GetWithDetailsAsync(s.ScheduleId);
            results.Add(MapToDto(full!));
        }
        return results;
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
                dto.RoomId.Value, schedule.DefenseDate!.Value, schedule.StartTime!.Value, schedule.EndTime!.Value,
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
