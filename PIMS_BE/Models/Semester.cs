using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class Semester
{
    [Key]
    public int SemesterId { get; set; }

    [StringLength(50)]
    public string SemesterName { get; set; } = null!;

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool? IsActive { get; set; }

    [InverseProperty("Semester")]
    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
}
