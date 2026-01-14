using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class AssessmentCriterion
{
    [Key]
    public int CriteriaId { get; set; }

    public int? AssessmentId { get; set; }

    [StringLength(255)]
    public string? CriteriaName { get; set; }

    public double? Weight { get; set; }

    public double? MaxScore { get; set; }

    [ForeignKey("AssessmentId")]
    [InverseProperty("AssessmentCriteria")]
    public virtual Assessment? Assessment { get; set; }

    [InverseProperty("Criteria")]
    public virtual ICollection<CriteriaGrade> CriteriaGrades { get; set; } = new List<CriteriaGrade>();
}
