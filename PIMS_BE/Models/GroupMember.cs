using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class GroupMember
{
    [Key]
    public int GroupMemberId { get; set; }

    public int? GroupId { get; set; }

    public int? StudentId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? JoinedAt { get; set; }

    [ForeignKey("GroupId")]
    [InverseProperty("GroupMembers")]
    public virtual Group? Group { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("GroupMembers")]
    public virtual User? Student { get; set; }
}
