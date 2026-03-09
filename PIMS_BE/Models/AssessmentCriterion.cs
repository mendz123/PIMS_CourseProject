using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class AssessmentCriterion
{
    public int CriteriaId { get; set; }

    public int AssessmentId { get; set; }

    public string? CriteriaName { get; set; }

    public decimal? Weight { get; set; }

    public virtual Assessment Assessment { get; set; } = null!;

    public virtual ICollection<CouncilCriteriaGrade> CouncilCriteriaGrades { get; set; } = new List<CouncilCriteriaGrade>();

    public virtual ICollection<CriteriaGrade> CriteriaGrades { get; set; } = new List<CriteriaGrade>();
}
