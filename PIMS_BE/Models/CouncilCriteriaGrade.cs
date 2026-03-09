using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class CouncilCriteriaGrade
{
    public int GradeId { get; set; }

    public int CouncilId { get; set; }

    public int GroupId { get; set; }

    public int UserId { get; set; }

    public int TeacherId { get; set; }

    public int CriteriaId { get; set; }

    public decimal? Score { get; set; }

    public virtual Council Council { get; set; } = null!;

    public virtual AssessmentCriterion Criteria { get; set; } = null!;

    public virtual Group Group { get; set; } = null!;

    public virtual User Teacher { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
