using PIMS_BE.DTOs.Room;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository            _roomRepo;
    private readonly IDefenseScheduleRepository _scheduleRepo;

    public RoomService(IRoomRepository roomRepo, IDefenseScheduleRepository scheduleRepo)
    {
        _roomRepo     = roomRepo;
        _scheduleRepo = scheduleRepo;
    }

    public async Task<IEnumerable<RoomDto>> GetAllAsync()
    {
        var rooms = await _roomRepo.GetAllAsync();
        return rooms
            .OrderBy(r => r.Building)
            .ThenBy(r => r.RoomName)
            .Select(MapToDto);
    }

    public async Task<RoomDto?> GetByIdAsync(int id)
    {
        var room = await _roomRepo.GetByIdAsync(id);
        return room == null ? null : MapToDto(room);
    }

    public async Task<RoomDto> CreateAsync(CreateRoomDto dto)
    {
        if (await _roomRepo.IsRoomNameExistsAsync(dto.RoomName))
            throw new InvalidOperationException($"Room name '{dto.RoomName}' already exists");

        var room = new Room
        {
            RoomName = dto.RoomName,
            Building = dto.Building,
            Capacity = dto.Capacity
        };

        await _roomRepo.AddAsync(room);
        await _roomRepo.SaveChangesAsync();
        return MapToDto(room);
    }

    public async Task<RoomDto> UpdateAsync(int id, UpdateRoomDto dto)
    {
        var room = await _roomRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Room {id} not found");

        if (dto.RoomName != null && dto.RoomName != room.RoomName)
        {
            if (await _roomRepo.IsRoomNameExistsAsync(dto.RoomName))
                throw new InvalidOperationException($"Room name '{dto.RoomName}' already exists");
            room.RoomName = dto.RoomName;
        }

        if (dto.Building != null) room.Building = dto.Building;
        if (dto.Capacity.HasValue) room.Capacity = dto.Capacity;

        _roomRepo.Update(room);
        await _roomRepo.SaveChangesAsync();
        return MapToDto(room);
    }

    public async Task DeleteAsync(int id)
    {
        var room = await _roomRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Room {id} not found");

        // TC-ROOM-07: include the scheduleId that is using this room
        var scheduleId = await _scheduleRepo.GetScheduleIdByRoomAsync(id);
        if (scheduleId.HasValue)
            throw new InvalidOperationException(
                $"Cannot delete room: currently assigned to defense schedule id {scheduleId.Value}");

        _roomRepo.Remove(room);
        await _roomRepo.SaveChangesAsync();
    }

    private static RoomDto MapToDto(Room r) => new()
    {
        RoomId   = r.RoomId,
        RoomName = r.RoomName,
        Building = r.Building,
        Capacity = r.Capacity
    };
}
