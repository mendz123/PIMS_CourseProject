using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class StudentCourseResult
{
    public int ResultId { get; set; }

    public int? StudentId { get; set; }

    public int? ClassId { get; set; }

    public double? FinalAverageScore { get; set; }

    public string? CourseStatus { get; set; }

    public string? Note { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Class? Class { get; set; }

    public virtual User? Student { get; set; }
}
