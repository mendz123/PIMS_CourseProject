using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Semester
{
    public int SemesterId { get; set; }

    public string? SemesterName { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int? MinGroupSize { get; set; }

    public int? MaxGroupSize { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();

    public virtual ICollection<Council> Councils { get; set; } = new List<Council>();

    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();

    public virtual ICollection<ProjectTemplate> ProjectTemplates { get; set; } = new List<ProjectTemplate>();

    public virtual ICollection<StudentFinalResult> StudentFinalResults { get; set; } = new List<StudentFinalResult>();
}
