using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class StudentCourseResult
{
    [Key]
    public int ResultId { get; set; }

    public int? StudentId { get; set; }

    public int? ClassId { get; set; }

    public double? FinalAverageScore { get; set; }

    [StringLength(20)]
    public string? CourseStatus { get; set; }

    public string? Note { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("ClassId")]
    [InverseProperty("StudentCourseResults")]
    public virtual Class? Class { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("StudentCourseResults")]
    public virtual User? Student { get; set; }
}
