using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Project
{
    public int ProjectId { get; set; }

    public int? GroupId { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public int? StatusId { get; set; }

    public string? TeacherNote { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Group? Group { get; set; }

    public virtual ProjectStatus? Status { get; set; }
}
