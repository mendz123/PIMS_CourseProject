using System;
using System.Collections.Generic;

namespace PIMS_BE.Models.Chat;

public partial class ConversationParticipant
{
    public int Id { get; set; }

    public int ConversationId { get; set; }

    public int UserId { get; set; }

    public int Role { get; set; }

    public DateTime JoinedAt { get; set; }

    public int? LastReadMessageId { get; set; }

    public bool IsMuted { get; set; }

    public bool IsDeleted { get; set; }

    public virtual Conversation Conversation { get; set; } = null!;
}
