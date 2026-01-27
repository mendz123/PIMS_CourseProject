using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class ProjectTemplate
{
    public int TemplateId { get; set; }

    public int SemesterId { get; set; }

    public int CreatedBy { get; set; }

    public string TemplateName { get; set; } = null!;

    public string TemplateUrl { get; set; } = null!;

    public string? FileResourceId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Semester Semester { get; set; } = null!;
}
