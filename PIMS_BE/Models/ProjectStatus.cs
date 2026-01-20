using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class ProjectStatus
{
    public int StatusId { get; set; }

    public string? StatusName { get; set; }

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
}
