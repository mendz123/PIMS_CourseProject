using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

[Index("AssessmentId", "StudentId", Name = "UC_Assessment_Student", IsUnique = true)]
public partial class AssessmentScore
{
    [Key]
    public int ScoreId { get; set; }

    public int? AssessmentId { get; set; }

    public int? StudentId { get; set; }

    public int? GroupId { get; set; }

    public double? Score { get; set; }

    public string? TeacherNote { get; set; }

    public int? GradedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? GradedAt { get; set; }

    [ForeignKey("AssessmentId")]
    [InverseProperty("AssessmentScores")]
    public virtual Assessment? Assessment { get; set; }

    [ForeignKey("GradedBy")]
    [InverseProperty("AssessmentScoreGradedByNavigations")]
    public virtual User? GradedByNavigation { get; set; }

    [ForeignKey("GroupId")]
    [InverseProperty("AssessmentScores")]
    public virtual Group? Group { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("AssessmentScoreStudents")]
    public virtual User? Student { get; set; }
}
