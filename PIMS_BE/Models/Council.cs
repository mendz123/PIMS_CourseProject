using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class Council
{
    [Key]
    public int CouncilId { get; set; }

    [StringLength(100)]
    public string? CouncilName { get; set; }

    public int? AssessmentId { get; set; }

    public int? Round { get; set; }

    public int? StatusId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("AssessmentId")]
    [InverseProperty("Councils")]
    public virtual Assessment? Assessment { get; set; }

    [InverseProperty("Council")]
    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    [InverseProperty("Council")]
    public virtual ICollection<Grader> Graders { get; set; } = new List<Grader>();

    [ForeignKey("StatusId")]
    [InverseProperty("Councils")]
    public virtual CouncilStatus? Status { get; set; }
}
