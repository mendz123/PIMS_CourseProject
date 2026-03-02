namespace PIMS_BE.DTOs.DefenseSchedule;

/// <summary>UC24 — Assign a room to a defense session</summary>
public class AssignRoomDto
{
    /// <summary>RoomId from the Rooms table. Pass null to unassign the room.</summary>
    public int? RoomId { get; set; }
}
