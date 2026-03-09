using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class MentorRequestStatus
{
    public int StatusId { get; set; }

    public string? StatusName { get; set; }

    public virtual ICollection<MentorRequest> MentorRequests { get; set; } = new List<MentorRequest>();
}
