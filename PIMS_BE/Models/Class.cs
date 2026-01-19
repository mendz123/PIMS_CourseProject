using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Class
{
    public int ClassId { get; set; }

    public string ClassCode { get; set; } = null!;

    public string? ClassName { get; set; }

    public int? SemesterId { get; set; }

    public int? TeacherId { get; set; }

    public int? MinGroupSize { get; set; }

    public int? MaxGroupSize { get; set; }

    public DateTime? GroupDeadline { get; set; }

    public int? StatusId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();

    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();

    public virtual Semester? Semester { get; set; }

    public virtual ClassStatus? Status { get; set; }

    public virtual ICollection<StudentCourseResult> StudentCourseResults { get; set; } = new List<StudentCourseResult>();

    public virtual User? Teacher { get; set; }
}
