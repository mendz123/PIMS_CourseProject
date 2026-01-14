using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class Grader
{
    [Key]
    public int GraderId { get; set; }

    public int? AssessmentId { get; set; }

    public int? TeacherId { get; set; }

    public int? CouncilId { get; set; }

    [ForeignKey("AssessmentId")]
    [InverseProperty("Graders")]
    public virtual Assessment? Assessment { get; set; }

    [ForeignKey("CouncilId")]
    [InverseProperty("Graders")]
    public virtual Council? Council { get; set; }

    [InverseProperty("Grader")]
    public virtual ICollection<CriteriaGrade> CriteriaGrades { get; set; } = new List<CriteriaGrade>();

    [ForeignKey("TeacherId")]
    [InverseProperty("Graders")]
    public virtual User? Teacher { get; set; }

    [InverseProperty("Grader")]
    public virtual ICollection<TeacherAssessment> TeacherAssessments { get; set; } = new List<TeacherAssessment>();
}
