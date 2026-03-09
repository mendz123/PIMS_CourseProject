using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class GroupMemberStatus
{
    public int StatusId { get; set; }

    public string? StatusName { get; set; }

    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();
}
