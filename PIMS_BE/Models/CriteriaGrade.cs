using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

[Index("GraderId", "StudentId", "CriteriaId", Name = "UC_Grader_Student_Criteria", IsUnique = true)]
public partial class CriteriaGrade
{
    [Key]
    public int GradeId { get; set; }

    public int? GraderId { get; set; }

    public int? StudentId { get; set; }

    public int? CriteriaId { get; set; }

    public double? Score { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? GradedAt { get; set; }

    [ForeignKey("CriteriaId")]
    [InverseProperty("CriteriaGrades")]
    public virtual AssessmentCriterion? Criteria { get; set; }

    [ForeignKey("GraderId")]
    [InverseProperty("CriteriaGrades")]
    public virtual Grader? Grader { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("CriteriaGrades")]
    public virtual User? Student { get; set; }
}
