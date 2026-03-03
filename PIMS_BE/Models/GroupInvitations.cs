using System;

namespace PIMS_BE.Models;

public enum InvitationStatus
{
    Pending = 0,
    Accepted = 1,
    Rejected = 2
}

public partial class GroupInvitation
{
    public int InvitationId { get; set; }

    public int GroupId { get; set; }

    public int InvitedUserId { get; set; }

    public int InvitedByUserId { get; set; }

    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;

    public DateTime CreatedAt { get; set; }

    public virtual Group Group { get; set; } = null!;

    public virtual User InvitedUser { get; set; } = null!;

    public virtual User InvitedByUser { get; set; } = null!;
}