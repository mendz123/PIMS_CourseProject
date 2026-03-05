using System;
using System.Collections.Generic;

namespace PIMS_BE.Models.Chat;

public partial class Conversation
{
    public int Id { get; set; }

    public int Type { get; set; }

    public string? Name { get; set; }

    public int CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsDeleted { get; set; }

    public virtual ICollection<ConversationParticipant> ConversationParticipants { get; set; } = new List<ConversationParticipant>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
