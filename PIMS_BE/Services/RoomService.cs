using PIMS_BE.DTOs.Room;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepo;

    public RoomService(IRoomRepository roomRepo)
    {
        _roomRepo = roomRepo;
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

    public async Task DeleteAsync(int id)
    {
        var room = await _roomRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Room {id} not found");

        if (await _roomRepo.IsRoomInUseAsync(id))
            throw new InvalidOperationException("Cannot delete a room that is currently assigned to a defense schedule");

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
