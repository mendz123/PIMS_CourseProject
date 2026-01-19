using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class ClassStatus
{
    public int StatusId { get; set; }

    public string StatusName { get; set; } = null!;

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
}
