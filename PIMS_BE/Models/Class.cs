using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

[Index("ClassCode", Name = "UQ__Classes__2ECD4A55B7BAF363", IsUnique = true)]
public partial class Class
{
    [Key]
    public int ClassId { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string ClassCode { get; set; } = null!;

    [StringLength(255)]
    public string? ClassName { get; set; }

    public int? SemesterId { get; set; }

    public int? TeacherId { get; set; }

    public int? MinGroupSize { get; set; }

    public int? MaxGroupSize { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? GroupDeadline { get; set; }

    public int? StatusId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Class")]
    public virtual ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();

    [InverseProperty("Class")]
    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    [InverseProperty("Class")]
    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();

    [ForeignKey("SemesterId")]
    [InverseProperty("Classes")]
    public virtual Semester? Semester { get; set; }

    [ForeignKey("StatusId")]
    [InverseProperty("Classes")]
    public virtual ClassStatus? Status { get; set; }

    [ForeignKey("TeacherId")]
    [InverseProperty("Classes")]
    public virtual User? Teacher { get; set; }
}
