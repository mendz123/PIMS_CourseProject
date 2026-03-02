using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Room
{
    public int RoomId { get; set; }

    public string RoomName { get; set; } = null!;

    public string? Building { get; set; }

    public int? Capacity { get; set; }

    public virtual ICollection<DefenseSchedule> DefenseSchedules { get; set; } = new List<DefenseSchedule>();
}
