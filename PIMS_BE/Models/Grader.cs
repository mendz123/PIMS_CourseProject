using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Grader
{
    public int GraderId { get; set; }

    public int? AssessmentId { get; set; }

    public int? TeacherId { get; set; }

    public int? CouncilId { get; set; }

    public virtual Assessment? Assessment { get; set; }

    public virtual Council? Council { get; set; }

    public virtual ICollection<CriteriaGrade> CriteriaGrades { get; set; } = new List<CriteriaGrade>();

    public virtual User? Teacher { get; set; }

    public virtual ICollection<TeacherAssessment> TeacherAssessments { get; set; } = new List<TeacherAssessment>();
}
