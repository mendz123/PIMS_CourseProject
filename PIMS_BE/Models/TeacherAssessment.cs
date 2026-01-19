using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class TeacherAssessment
{
    public int TeacherAssessmentId { get; set; }

    public int? GraderId { get; set; }

    public int? StudentId { get; set; }

    public string? TeacherNote { get; set; }

    public double? RawScore { get; set; }

    public DateTime? GradedAt { get; set; }

    public virtual Grader? Grader { get; set; }

    public virtual User? Student { get; set; }
}
