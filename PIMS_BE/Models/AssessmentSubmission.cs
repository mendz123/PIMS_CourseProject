using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class AssessmentSubmission
{
    public int SubmissionId { get; set; }

    public int? AssessmentId { get; set; }

    public int? GroupId { get; set; }

    public int? UploadedBy { get; set; }

    public string? Description { get; set; }

    public DateTime? UploadedAt { get; set; }

    public virtual Assessment? Assessment { get; set; }

    public virtual Group? Group { get; set; }

    public virtual ICollection<SubmissionFile> SubmissionFiles { get; set; } = new List<SubmissionFile>();

    public virtual User? UploadedByNavigation { get; set; }
}
