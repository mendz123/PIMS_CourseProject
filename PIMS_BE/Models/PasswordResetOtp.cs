using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class PasswordResetOtp
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string OtpCode { get; set; } = null!;

    public DateTime ExpiredAt { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UsedAt { get; set; }
}
