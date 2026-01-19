using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class CriteriaGrade
{
    public int GradeId { get; set; }

    public int? GraderId { get; set; }

    public int? StudentId { get; set; }

    public int? CriteriaId { get; set; }

    public double? Score { get; set; }

    public DateTime? GradedAt { get; set; }

    public virtual AssessmentCriterion? Criteria { get; set; }

    public virtual Grader? Grader { get; set; }

    public virtual User? Student { get; set; }
}
