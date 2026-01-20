using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class MentorRequest
{
    public int RequestId { get; set; }

    public int GroupId { get; set; }

    public int UserId { get; set; }

    public string? Message { get; set; }

    public int? StatusId { get; set; }

    public string? TeacherComment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Group Group { get; set; } = null!;

    public virtual MentorRequestStatus? Status { get; set; }

    public virtual User User { get; set; } = null!;
}
