using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class AssessmentScore
{
    public int ScoreId { get; set; }

    public int AssessmentId { get; set; }

    public int UserId { get; set; }

    public decimal? Score { get; set; }

    public bool? IsPassed { get; set; }

    public virtual Assessment Assessment { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
