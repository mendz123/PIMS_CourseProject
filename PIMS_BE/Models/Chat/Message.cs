using System;
using System.Collections.Generic;

namespace PIMS_BE.Models.Chat;

public partial class Message
{
    public int Id { get; set; }

    public int ConversationId { get; set; }

    public int SenderId { get; set; }

    public string? Content { get; set; }

    public int MessageType { get; set; }

    public string? FileUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsDeleted { get; set; }

    public virtual Conversation Conversation { get; set; } = null!;
}
