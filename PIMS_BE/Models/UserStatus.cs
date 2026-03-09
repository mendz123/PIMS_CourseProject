using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class UserStatus
{
    public int StatusId { get; set; }

    public string StatusName { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
