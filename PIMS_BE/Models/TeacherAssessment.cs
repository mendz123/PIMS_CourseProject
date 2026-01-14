using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

[Index("GraderId", "StudentId", Name = "UC_Grader_Student", IsUnique = true)]
public partial class TeacherAssessment
{
    [Key]
    public int TeacherAssessmentId { get; set; }

    public int? GraderId { get; set; }

    public int? StudentId { get; set; }

    public string? TeacherNote { get; set; }

    public double? RawScore { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? GradedAt { get; set; }

    [ForeignKey("GraderId")]
    [InverseProperty("TeacherAssessments")]
    public virtual Grader? Grader { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("TeacherAssessments")]
    public virtual User? Student { get; set; }
}
