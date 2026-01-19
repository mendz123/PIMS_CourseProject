using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class GroupMember
{
    public int GroupMemberId { get; set; }

    public int? GroupId { get; set; }

    public int? StudentId { get; set; }

    public DateTime? JoinedAt { get; set; }

    public string? Status { get; set; }

    public DateTime? LeftAt { get; set; }

    public virtual Group? Group { get; set; }

    public virtual User? Student { get; set; }
}
