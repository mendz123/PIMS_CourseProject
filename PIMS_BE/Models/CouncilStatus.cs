using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class CouncilStatus
{
    public int StatusId { get; set; }

    public string StatusName { get; set; } = null!;

    public virtual ICollection<Council> Councils { get; set; } = new List<Council>();
}
