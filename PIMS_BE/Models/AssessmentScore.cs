using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class AssessmentScore
{
    public int ScoreId { get; set; }

    public int? AssessmentId { get; set; }

    public int? StudentId { get; set; }

    public int? GroupId { get; set; }

    public double? Score { get; set; }

    public bool? IsPassed { get; set; }

    public int? CouncilId { get; set; }

    public DateTime? GradedAt { get; set; }

    public virtual Assessment? Assessment { get; set; }

    public virtual Council? Council { get; set; }

    public virtual Group? Group { get; set; }

    public virtual User? Student { get; set; }
}
