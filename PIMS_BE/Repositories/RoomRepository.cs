using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface IRoomRepository : IGenericRepository<Room>
{
    Task<bool> IsRoomNameExistsAsync(string roomName, int? excludeRoomId = null);
    Task<bool> IsRoomInUseAsync(int roomId);
}

public class RoomRepository : GenericRepository<Room>, IRoomRepository
{
    public RoomRepository(PimsDbContext context) : base(context) { }

    public async Task<bool> IsRoomNameExistsAsync(string roomName, int? excludeRoomId = null)
    {
        return await _context.Rooms
            .AnyAsync(r => r.RoomName == roomName &&
                           (!excludeRoomId.HasValue || r.RoomId != excludeRoomId.Value));
    }

    public async Task<bool> IsRoomInUseAsync(int roomId)
    {
        return await _context.DefenseSchedules
            .AnyAsync(ds => ds.RoomId == roomId);
    }
}
