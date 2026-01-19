using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class AssessmentCriterion
{
    public int CriteriaId { get; set; }

    public int? AssessmentId { get; set; }

    public string? CriteriaName { get; set; }

    public double? Weight { get; set; }

    public double? MaxScore { get; set; }

    public virtual Assessment? Assessment { get; set; }

    public virtual ICollection<CriteriaGrade> CriteriaGrades { get; set; } = new List<CriteriaGrade>();
}
