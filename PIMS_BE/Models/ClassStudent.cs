using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class ClassStudent
{
    public int ClassStudentId { get; set; }

    public int? ClassId { get; set; }

    public string StudentEmail { get; set; } = null!;

    public int? StudentId { get; set; }

    public int? StatusId { get; set; }

    public virtual Class? Class { get; set; }

    public virtual ClassStudentStatus? Status { get; set; }

    public virtual User? Student { get; set; }
}
