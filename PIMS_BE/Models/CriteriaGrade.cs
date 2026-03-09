using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class CriteriaGrade
{
    public int GradeId { get; set; }

    public int UserId { get; set; }

    public int CriteriaId { get; set; }

    public int TeacherId { get; set; }

    public decimal? Score { get; set; }

    public virtual AssessmentCriterion Criteria { get; set; } = null!;

    public virtual User Teacher { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
