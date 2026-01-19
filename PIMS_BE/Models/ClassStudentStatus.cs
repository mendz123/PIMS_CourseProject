using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class ClassStudentStatus
{
    public int StatusId { get; set; }

    public string StatusName { get; set; } = null!;

    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();
}
