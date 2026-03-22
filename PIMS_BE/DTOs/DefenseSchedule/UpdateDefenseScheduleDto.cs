using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.DefenseSchedule;

public class UpdateDefenseScheduleDto
{
    [Required]
    public int CouncilId { get; set; }

    [Required]
    public int GroupId { get; set; }

    [Required(ErrorMessage = "Defense date is required")]
    public DateOnly DefenseDate { get; set; }

    [Required(ErrorMessage = "Start time is required")]
    public TimeOnly StartTime { get; set; }

    [Required(ErrorMessage = "End time is required")]
    public TimeOnly EndTime { get; set; }

    /// <summary>Room ID (from Rooms table). Can be null — will be assigned later via UC24</summary>
    public int? RoomId { get; set; }
}
