using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class GroupStatus
{
    public int StatusId { get; set; }

    public string StatusName { get; set; } = null!;

    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();
}
