using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Room;

public class UpdateRoomDto
{
    [MaxLength(100)]
    public string? RoomName { get; set; }

    [MaxLength(100)]
    public string? Building { get; set; }

    [Range(1, 1000, ErrorMessage = "Capacity must be between 1 and 1000")]
    public int? Capacity { get; set; }
}
