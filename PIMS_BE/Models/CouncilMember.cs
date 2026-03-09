using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class CouncilMember
{
    public int CouncilMemberId { get; set; }

    public int CouncilId { get; set; }

    public int UserId { get; set; }

    public virtual Council Council { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
