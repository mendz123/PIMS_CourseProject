using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class Group
{
    [Key]
    public int GroupId { get; set; }

    public int? ClassId { get; set; }

    [StringLength(255)]
    public string? GroupName { get; set; }

    public int? LeaderId { get; set; }

    public int? StatusId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Group")]
    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    [InverseProperty("Group")]
    public virtual ICollection<AssessmentSubmission> AssessmentSubmissions { get; set; } = new List<AssessmentSubmission>();

    [ForeignKey("ClassId")]
    [InverseProperty("Groups")]
    public virtual Class? Class { get; set; }

    [InverseProperty("Group")]
    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    [ForeignKey("LeaderId")]
    [InverseProperty("Groups")]
    public virtual User? Leader { get; set; }

    [InverseProperty("Group")]
    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    [ForeignKey("StatusId")]
    [InverseProperty("Groups")]
    public virtual GroupStatus? Status { get; set; }
}
