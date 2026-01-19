using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Assessment
{
    public int AssessmentId { get; set; }

    public int? ClassId { get; set; }

    public string? Title { get; set; }

    public double Weight { get; set; }

    public double? MinScoreToPass { get; set; }

    public bool? IsFinal { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AssessmentCriterion> AssessmentCriteria { get; set; } = new List<AssessmentCriterion>();

    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    public virtual ICollection<AssessmentSubmission> AssessmentSubmissions { get; set; } = new List<AssessmentSubmission>();

    public virtual Class? Class { get; set; }

    public virtual ICollection<Council> Councils { get; set; } = new List<Council>();

    public virtual ICollection<Grader> Graders { get; set; } = new List<Grader>();
}
