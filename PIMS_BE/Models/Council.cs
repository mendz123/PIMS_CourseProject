using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Council
{
    public int CouncilId { get; set; }

    public string? CouncilName { get; set; }

    public int? AssessmentId { get; set; }

    public int? Round { get; set; }

    public int? StatusId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateOnly? DefenseDate { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public string? Location { get; set; }

    public virtual Assessment? Assessment { get; set; }

    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    public virtual ICollection<DefenseSchedule> DefenseSchedules { get; set; } = new List<DefenseSchedule>();

    public virtual ICollection<Grader> Graders { get; set; } = new List<Grader>();

    public virtual CouncilStatus? Status { get; set; }
}
