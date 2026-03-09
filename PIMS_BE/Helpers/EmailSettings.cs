namespace PIMS_BE.Helpers;

/// <summary>
/// Configuration settings for email service
/// </summary>
public class EmailSettings
{
    /// <summary>
    /// SMTP server host (e.g., smtp.gmail.com)
    /// </summary>
    public string SmtpHost { get; set; } = "smtp.gmail.com";

    /// <summary>
    /// SMTP server port (587 for TLS, 465 for SSL)
    /// </summary>
    public int SmtpPort { get; set; } = 587;

    /// <summary>
    /// Email address used to send emails
    /// </summary>
    public string SenderEmail { get; set; } = null!;

    /// <summary>
    /// Display name for the sender
    /// </summary>
    public string SenderName { get; set; } = "PIMS System";

    /// <summary>
    /// Gmail App Password (NOT your regular Gmail password)
    /// </summary>
    public string AppPassword { get; set; } = null!;

    /// <summary>
    /// Enable SSL/TLS
    /// </summary>
    public bool UseSsl { get; set; } = true;
}
