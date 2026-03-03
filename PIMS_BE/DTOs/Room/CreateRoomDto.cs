using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Room;

public class CreateRoomDto
{
    [Required(ErrorMessage = "Room name is required")]
    [MaxLength(100)]
    public string RoomName { get; set; } = null!;

    [MaxLength(100)]
    public string? Building { get; set; }

    [Range(1, 1000, ErrorMessage = "Capacity must be between 1 and 1000")]
    public int? Capacity { get; set; }
}
