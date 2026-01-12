using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class ClassStudent
{
    [Key]
    public int ClassStudentId { get; set; }

    public int? ClassId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? StudentEmail { get; set; }

    public int? StudentId { get; set; }

    public int? StatusId { get; set; }

    [ForeignKey("ClassId")]
    [InverseProperty("ClassStudents")]
    public virtual Class? Class { get; set; }

    [ForeignKey("StatusId")]
    [InverseProperty("ClassStudents")]
    public virtual ClassStudentStatus? Status { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("ClassStudents")]
    public virtual User? Student { get; set; }
}
