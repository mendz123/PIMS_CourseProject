using PIMS_BE.DTOs.Room;

namespace PIMS_BE.Services.Interfaces;

public interface IRoomService
{
    Task<IEnumerable<RoomDto>> GetAllAsync();
    Task<RoomDto?> GetByIdAsync(int id);
    Task<RoomDto> CreateAsync(CreateRoomDto dto);
    Task<RoomDto> UpdateAsync(int id, UpdateRoomDto dto);
    Task DeleteAsync(int id);
}
