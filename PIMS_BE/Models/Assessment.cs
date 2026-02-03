using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Assessment
{
    public int AssessmentId { get; set; }

    public int SemesterId { get; set; }

    public string? Title { get; set; }

    public decimal? Weight { get; set; }

    public bool? IsFinal { get; set; }

    public bool? IsLocked { get; set; }

    public int CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }


    public DateTime? StartDate { get; set; }

   
    public DateTime? Deadline { get; set; }

   
    public string? Description { get; set; }

    public virtual ICollection<AssessmentCriterion> AssessmentCriteria { get; set; } = new List<AssessmentCriterion>();

    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<ProjectSubmission> ProjectSubmissions { get; set; } = new List<ProjectSubmission>();

    public virtual Semester Semester { get; set; } = null!;
}
