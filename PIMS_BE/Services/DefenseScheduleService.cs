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

        // Validate Council (load kèm Semester để lấy StartDate/EndDate)
        var councilEntity = await _councilRepo.GetWithMembersAsync(dto.CouncilId)
            ?? throw new KeyNotFoundException($"Council {dto.CouncilId} not found");

        // Validate Group
        _ = await _groupRepo.GetByIdAsync(dto.GroupId)
            ?? throw new KeyNotFoundException($"Group {dto.GroupId} not found");

        // Validate Room nếu có
        if (dto.RoomId.HasValue)
            _ = await _roomRepo.GetByIdAsync(dto.RoomId.Value)
                ?? throw new KeyNotFoundException($"Room {dto.RoomId} not found");

        // Kiểm tra ngày thi nằm trong kì học
        ValidateDefenseDateInSemester(dto.DefenseDate, councilEntity.Semester);

        // Kiểm tra lịch thi hiện tại của nhóm trong kì và các business rules
        var existingSchedules = await _scheduleRepo.GetSchedulesByGroupInSemesterAsync(dto.GroupId, councilEntity.SemesterId);
        if (existingSchedules.Count >= 2)
            throw new InvalidOperationException(
                $"Group {dto.GroupId} already has {existingSchedules.Count} defense schedule(s) in this semester. Maximum is 2.");

        ValidateGroupSchedulesBusinessRules(dto.DefenseDate, dto.StartTime, existingSchedules);

        // Kiểm tra trùng lặp (CouncilId, GroupId, Date) — cho phép thi lại ngày khác
        bool alreadyExists = await _scheduleRepo.ExistsByCouncilGroupAndDateAsync(dto.CouncilId, dto.GroupId, dto.DefenseDate);
        if (alreadyExists)
            throw new InvalidOperationException(
                $"Group {dto.GroupId} already has a defense schedule with council {dto.CouncilId} on {dto.DefenseDate}");

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

    public async Task<DefenseScheduleDto> UpdateAsync(int scheduleId, UpdateDefenseScheduleDto dto)
    {
        var schedule = await _scheduleRepo.GetWithDetailsAsync(scheduleId)
            ?? throw new KeyNotFoundException($"Schedule {scheduleId} not found");

        if (dto.EndTime <= dto.StartTime)
            throw new ArgumentException("EndTime must be after StartTime");

        // Validate Council (load kèm Semester để lấy StartDate/EndDate)
        var councilEntity = await _councilRepo.GetWithMembersAsync(dto.CouncilId)
            ?? throw new KeyNotFoundException($"Council {dto.CouncilId} not found");

        // Validate Group
        _ = await _groupRepo.GetByIdAsync(dto.GroupId)
            ?? throw new KeyNotFoundException($"Group {dto.GroupId} not found");

        // Validate Room nếu có
        if (dto.RoomId.HasValue)
            _ = await _roomRepo.GetByIdAsync(dto.RoomId.Value)
                ?? throw new KeyNotFoundException($"Room {dto.RoomId} not found");

        // Kiểm tra ngày thi nằm trong kì học
        ValidateDefenseDateInSemester(dto.DefenseDate, councilEntity.Semester);

        // Kiểm tra lịch thi hiện tại của nhóm trong kì và các business rules (exclude current)
        var existingSchedules = await _scheduleRepo.GetSchedulesByGroupInSemesterAsync(dto.GroupId, councilEntity.SemesterId);
        int currentCount = existingSchedules.Count(s => s.ScheduleId != scheduleId);
        if (currentCount >= 2)
            throw new InvalidOperationException(
                $"Group {dto.GroupId} already has {currentCount} defense schedule(s) in this semester. Maximum is 2.");

        ValidateGroupSchedulesBusinessRules(dto.DefenseDate, dto.StartTime, existingSchedules, scheduleId);

        // Kiểm tra trùng lặp (CouncilId, GroupId, Date) — exclude current
        bool alreadyExists = await _scheduleRepo.ExistsByCouncilGroupAndDateAsync(
            dto.CouncilId, dto.GroupId, dto.DefenseDate, scheduleId);
        if (alreadyExists)
            throw new InvalidOperationException(
                $"Group {dto.GroupId} already has a defense schedule with council {dto.CouncilId} on {dto.DefenseDate}");

        // Kiểm tra trùng giờ trong cùng hội đồng + ngày (exclude current)
        bool hasConflict = await _scheduleRepo.IsTimeConflictAsync(
            dto.CouncilId, dto.DefenseDate, dto.StartTime, dto.EndTime, scheduleId);
        if (hasConflict)
            throw new InvalidOperationException(
                "Time conflict: the council already has a defense session in this time slot");

        // Check room time conflict (exclude current)
        if (dto.RoomId.HasValue)
        {
            bool roomConflict = await _scheduleRepo.IsRoomTimeConflictAsync(
                dto.RoomId.Value, dto.DefenseDate, dto.StartTime, dto.EndTime, scheduleId);
            if (roomConflict)
                throw new InvalidOperationException(
                    "Time conflict: room is already booked for another schedule overlapping this time");
        }

        // Update fields
        schedule.CouncilId   = dto.CouncilId;
        schedule.GroupId     = dto.GroupId;
        schedule.DefenseDate = dto.DefenseDate;
        schedule.StartTime   = dto.StartTime;
        schedule.EndTime     = dto.EndTime;
        schedule.RoomId      = dto.RoomId;
        schedule.Status      = dto.RoomId.HasValue ? "SCHEDULED" : "PENDING";

        _scheduleRepo.Update(schedule);
        await _scheduleRepo.SaveChangesAsync();

        var updated = await _scheduleRepo.GetWithDetailsAsync(scheduleId);
        return MapToDto(updated!);
    }

    public async Task DeleteAsync(int scheduleId)
    {
        var schedule = await _scheduleRepo.GetByIdAsync(scheduleId)
            ?? throw new KeyNotFoundException($"Schedule {scheduleId} not found");

        _scheduleRepo.Remove((DefenseSchedule)schedule);
        await _scheduleRepo.SaveChangesAsync();
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

        // Validate Council (load kèm Semester để lấy StartDate/EndDate)
        var councilEntity = await _councilRepo.GetWithMembersAsync(dto.CouncilId)
            ?? throw new KeyNotFoundException($"Council {dto.CouncilId} not found");

        // Validate Room nếu có
        if (dto.RoomId.HasValue)
            _ = await _roomRepo.GetByIdAsync(dto.RoomId.Value)
                ?? throw new KeyNotFoundException($"Room {dto.RoomId} not found");

        // Kiểm tra ngày thi nằm trong kì học
        ValidateDefenseDateInSemester(dto.DefenseDate, councilEntity.Semester);

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

            // Kiểm tra lịch thi hiện tại của nhóm trong kì và các business rules
            var existingSchedules = await _scheduleRepo.GetSchedulesByGroupInSemesterAsync(groupId, councilEntity.SemesterId);
            if (existingSchedules.Count >= 2)
                throw new InvalidOperationException(
                    $"Group {groupId} already has {existingSchedules.Count} defense schedule(s) in this semester. Maximum is 2.");

            ValidateGroupSchedulesBusinessRules(dto.DefenseDate, slotStart, existingSchedules);

            // Kiểm tra trùng (CouncilId, GroupId, Date) — cho phép thi lại ngày khác
            bool alreadyExists = await _scheduleRepo.ExistsByCouncilGroupAndDateAsync(dto.CouncilId, groupId, dto.DefenseDate);
            if (alreadyExists)
                throw new InvalidOperationException(
                    $"Group {groupId} has already been scheduled with council {dto.CouncilId} on {dto.DefenseDate}. " +
                    "Please choose a different date or remove this group from the selection.");

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
        // Tự động cập nhật status: gán phòng → SCHEDULED, xóa phòng → PENDING
        schedule.Status = dto.RoomId.HasValue ? "SCHEDULED" : "PENDING";
        _scheduleRepo.Update(schedule);
        await _scheduleRepo.SaveChangesAsync();

        var updated = await _scheduleRepo.GetWithDetailsAsync(scheduleId);
        return MapToDto(updated!);
    }

    public async Task<IEnumerable<GroupInfoDto>> GetEligibleGroupsAsync(int semesterId)
    {
        var groups = await _scheduleRepo.GetEligibleGroupsAsync(semesterId);
        return groups.Select(g => new GroupInfoDto
        {
            GroupId = g.GroupId,
            GroupName = g.GroupName,
            SemesterId = g.SemesterId
        });
    }

    private static void ValidateDefenseDateInSemester(DateOnly defenseDate, Semester? semester)
    {
        if (semester == null) return;

        if (semester.StartDate.HasValue && defenseDate < semester.StartDate.Value)
            throw new ArgumentException(
                $"Defense date {defenseDate} is before the semester start date ({semester.StartDate.Value}). " +
                $"Please choose a date within the semester '{semester.SemesterName}'.");

        if (semester.EndDate.HasValue && defenseDate > semester.EndDate.Value)
            throw new ArgumentException(
                $"Defense date {defenseDate} is after the semester end date ({semester.EndDate.Value}). " +
                $"Please choose a date within the semester '{semester.SemesterName}'.");
    }

    private static void ValidateGroupSchedulesBusinessRules(DateOnly newDate, TimeOnly startTime, List<DefenseSchedule> existingSchedules, int? currentScheduleId = null)
    {
        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);
        var currentTime = TimeOnly.FromDateTime(now);

        // 1. Không được tạo/sửa lịch ở ngày quá khứ
        if (newDate < today)
            throw new ArgumentException("Cannot schedule a defense session in the past.");
            
        if (newDate == today && startTime <= currentTime)
            throw new ArgumentException("Cannot schedule a defense session that has already started (time is in the past).");

        var otherSchedules = existingSchedules
            .Where(s => s.ScheduleId != currentScheduleId)
            .OrderBy(s => s.DefenseDate)
            .ToList();

        if (otherSchedules.Count > 0)
        {
            var firstExisting = otherSchedules[0];

            if (currentScheduleId == null)
            {
                // Hành động là CREATE (hoặc BULK CREATE) lịch thứ 2
                // Lịch 1 là firstExisting. Lịch đang tạo là lịch 2.

                // 2. Lịch thứ 2 chỉ được tạo khi lịch 1 đã bảo vệ xong
                bool isFirstFinished = today > firstExisting.DefenseDate || 
                                       (today == firstExisting.DefenseDate && currentTime > firstExisting.EndTime);

                if (!isFirstFinished)
                    throw new InvalidOperationException(
                        "Cannot schedule a retake session before the first defense session has finished. " +
                        $"The first session is scheduled on {firstExisting.DefenseDate} at {firstExisting.StartTime}-{firstExisting.EndTime}.");

                // 3. Lịch thứ 2 phải ở ngày sau lịch 1
                if (newDate <= firstExisting.DefenseDate)
                    throw new ArgumentException(
                        $"The retake session must be scheduled on a later date than the first session ({firstExisting.DefenseDate}).");
            }
            else
            {
                // Hành động là UPDATE
                // Đảm bảo không trùng ngày với các lịch khác của cùng nhóm
                if (otherSchedules.Any(s => s.DefenseDate == newDate))
                    throw new ArgumentException("Group already has another defense session on this date.");
            }
        }
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
