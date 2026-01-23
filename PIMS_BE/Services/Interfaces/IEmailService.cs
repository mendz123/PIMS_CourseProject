namespace PIMS_BE.Services.Interfaces;

/// <summary>
/// Interface for Email service operations
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send a generic email
    /// </summary>
    /// <param name="toEmail">Recipient email address</param>
    /// <param name="subject">Email subject</param>
    /// <param name="htmlBody">HTML body content</param>
    /// <returns>True if email sent successfully</returns>
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody);

    /// <summary>
    /// Send a welcome email to new user
    /// </summary>
    /// <param name="toEmail">Recipient email address</param>
    /// <param name="userName">User's display name</param>
    /// <returns>True if email sent successfully</returns>
    Task<bool> SendWelcomeEmailAsync(string toEmail, string userName);

    /// <summary>
    /// Send password reset email with reset link
    /// </summary>
    /// <param name="toEmail">Recipient email address</param>
    /// <param name="resetToken">Password reset token</param>
    /// <returns>True if email sent successfully</returns>
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken);

    /// <summary>
    /// Send notification email
    /// </summary>
    /// <param name="toEmail">Recipient email address</param>
    /// <param name="title">Notification title</param>
    /// <param name="message">Notification message</param>
    /// <returns>True if email sent successfully</returns>
    Task<bool> SendNotificationEmailAsync(string toEmail, string title, string message);

    /// <summary>
    /// Send email verification link to new user
    /// </summary>
    /// <param name="toEmail">Recipient email address</param>
    /// <param name="userName">User's display name</param>
    /// <param name="verificationLink">Full verification URL with token</param>
    /// <returns>True if email sent successfully</returns>
    Task<bool> SendVerificationEmailAsync(string toEmail, string userName, string verificationLink);
}
