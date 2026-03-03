using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Room;

public class UpdateRoomDto
{
    [MaxLength(100)]
    public string? RoomName { get; set; }

    [MaxLength(100)]
    public string? Building { get; set; }

    [Range(1, 10000)]
    public int? Capacity { get; set; }
}
