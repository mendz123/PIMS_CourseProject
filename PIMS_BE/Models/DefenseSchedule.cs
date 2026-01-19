using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
namespace PIMS_BE.Models;

public partial class DefenseSchedule
{
    [Key]
    public int ScheduleId { get; set; }

    public int? CouncilId { get; set; }

    public int? GroupId { get; set; }

    public DateOnly? DefenseDate { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public string? Location { get; set; }

    public string? Status { get; set; }

    public virtual Council? Council { get; set; }

    public virtual Group? Group { get; set; }
}
