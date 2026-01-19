using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class SubmissionFile
{
    public int FileId { get; set; }

    public int? SubmissionId { get; set; }

    public string? FileName { get; set; }

    public string? FileUrl { get; set; }

    public string? FileType { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual AssessmentSubmission? Submission { get; set; }
}
