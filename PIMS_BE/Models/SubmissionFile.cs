using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class SubmissionFile
{
    [Key]
    public int FileId { get; set; }

    public int? SubmissionId { get; set; }

    [StringLength(255)]
    public string? FileName { get; set; }

    [StringLength(1000)]
    [Unicode(false)]
    public string? FileUrl { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string? FileType { get; set; }

    public double? FileSize { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("SubmissionId")]
    [InverseProperty("SubmissionFiles")]
    public virtual AssessmentSubmission? Submission { get; set; }
}
