using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

[Index("StudentId", "AssessmentId", "CouncilId", Name = "UC_Student_Assessment", IsUnique = true)]
public partial class AssessmentScore
{
    [Key]
    public int ScoreId { get; set; }

    public int? AssessmentId { get; set; }

    public int? StudentId { get; set; }

    public int? GroupId { get; set; }

    public double? Score { get; set; }

    public bool? IsPassed { get; set; }

    public int? CouncilId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? GradedAt { get; set; }

    [ForeignKey("AssessmentId")]
    [InverseProperty("AssessmentScores")]
    public virtual Assessment? Assessment { get; set; }

    [ForeignKey("CouncilId")]
    [InverseProperty("AssessmentScores")]
    public virtual Council? Council { get; set; }

    [ForeignKey("GroupId")]
    [InverseProperty("AssessmentScores")]
    public virtual Group? Group { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("AssessmentScores")]
    public virtual User? Student { get; set; }
}
