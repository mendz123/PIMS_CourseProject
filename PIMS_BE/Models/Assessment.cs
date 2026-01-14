using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class Assessment
{
    [Key]
    public int AssessmentId { get; set; }

    public int? ClassId { get; set; }

    [StringLength(255)]
    public string? Title { get; set; }

    public double Weight { get; set; }

    public double? MinScoreToPass { get; set; }

    public bool? IsFinal { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DueDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Assessment")]
    public virtual ICollection<AssessmentCriterion> AssessmentCriteria { get; set; } = new List<AssessmentCriterion>();

    [InverseProperty("Assessment")]
    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    [InverseProperty("Assessment")]
    public virtual ICollection<AssessmentSubmission> AssessmentSubmissions { get; set; } = new List<AssessmentSubmission>();

    [ForeignKey("ClassId")]
    [InverseProperty("Assessments")]
    public virtual Class? Class { get; set; }

    [InverseProperty("Assessment")]
    public virtual ICollection<Council> Councils { get; set; } = new List<Council>();

    [InverseProperty("Assessment")]
    public virtual ICollection<Grader> Graders { get; set; } = new List<Grader>();
}
