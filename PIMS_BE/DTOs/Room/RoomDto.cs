namespace PIMS_BE.DTOs.Room;

public class RoomDto
{
    public int     RoomId   { get; set; }
    public string  RoomName { get; set; } = null!;
    public string? Building { get; set; }
    public int?    Capacity { get; set; }
}
