using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class Project
{
    [Key]
    public int ProjectId { get; set; }

    public int? GroupId { get; set; }

    [StringLength(255)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public int? StatusId { get; set; }

    public string? TeacherNote { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("GroupId")]
    [InverseProperty("Projects")]
    public virtual Group? Group { get; set; }

    [ForeignKey("StatusId")]
    [InverseProperty("Projects")]
    public virtual ProjectStatus? Status { get; set; }
}
