namespace PIMS_BE.DTOs.DefenseSchedule;

public class DefenseScheduleDto
{
    public int      ScheduleId   { get; set; }
    public int      CouncilId    { get; set; }
    public string   CouncilName  { get; set; } = null!;
    public int      GroupId      { get; set; }
    public string   GroupName    { get; set; } = null!;
    public DateOnly? DefenseDate { get; set; }
    public TimeOnly? StartTime   { get; set; }
    public TimeOnly? EndTime     { get; set; }
    public int?     RoomId       { get; set; }
    public string?  RoomName     { get; set; }
    public string?  Location     { get; set; }
    public string?  Status       { get; set; }
}
