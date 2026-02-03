using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class ProjectSubmission
{
    public int SubmissionId { get; set; }

    public int ProjectId { get; set; }

    public int SubmitterId { get; set; }

    public string FileName { get; set; } = null!;

    public string ReportUrl { get; set; } = null!;

    public string? FileResourceId { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public int AssessmentId { get; set; }

    public int GroupId { get; set; }

    public virtual Assessment Assessment { get; set; } = null!;

    public virtual Group Group { get; set; } = null!;

    public virtual Project Project { get; set; } = null!;

    public virtual User Submitter { get; set; } = null!;
}
