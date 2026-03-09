using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class StudentFinalResult
{
    public int ResultId { get; set; }

    public int UserId { get; set; }

    public int SemesterId { get; set; }

    public decimal? TotalScore { get; set; }

    public string? Grade { get; set; }

    public bool? IsPassed { get; set; }

    public bool? IsFinalized { get; set; }

    public DateTime? FinalizedAt { get; set; }

    public virtual Semester Semester { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
