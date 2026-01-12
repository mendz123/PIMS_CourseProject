using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class AssessmentSubmission
{
    [Key]
    public int SubmissionId { get; set; }

    public int? AssessmentId { get; set; }

    public int? GroupId { get; set; }

    public int? UploadedBy { get; set; }

    public string? Description { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UploadedAt { get; set; }

    [ForeignKey("AssessmentId")]
    [InverseProperty("AssessmentSubmissions")]
    public virtual Assessment? Assessment { get; set; }

    [ForeignKey("GroupId")]
    [InverseProperty("AssessmentSubmissions")]
    public virtual Group? Group { get; set; }

    [InverseProperty("Submission")]
    public virtual ICollection<SubmissionFile> SubmissionFiles { get; set; } = new List<SubmissionFile>();

    [ForeignKey("UploadedBy")]
    [InverseProperty("AssessmentSubmissions")]
    public virtual User? UploadedByNavigation { get; set; }
}
