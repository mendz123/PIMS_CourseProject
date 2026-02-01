using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using PIMS_BE.Helpers;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

/// <summary>
/// Email service implementation using MailKit and Gmail SMTP
/// </summary>
public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Connect to SMTP server
            await client.ConnectAsync(
                _emailSettings.SmtpHost, 
                _emailSettings.SmtpPort, 
                _emailSettings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None
            );

            // Authenticate with Gmail App Password
            await client.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.AppPassword);

            // Send the email
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            return false;
        }
    }

    /// <inheritdoc/>
    public async Task<bool> SendWelcomeEmailAsync(string toEmail, string userName)
    {
        var subject = "Welcome to PIMS - Project Information Management System";
        var htmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🎉 Welcome to PIMS!</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {userName}!</h2>
                        <p>Your account has been successfully created. Welcome to the Project Information Management System!</p>
                        <p>You can now:</p>
                        <ul>
                            <li>View and manage your projects</li>
                            <li>Collaborate with your team</li>
                            <li>Track project progress</li>
                        </ul>
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                    </div>
                    <div class='footer'>
                        <p>© 2026 PIMS - Project Information Management System</p>
                    </div>
                </div>
            </body>
            </html>";

        return await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc/>
    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken)
    {
        var subject = "PIMS - Password Reset Request";
        var resetLink = $"https://your-domain.com/reset-password?token={resetToken}";
        
        var htmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                    .warning {{ background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-top: 20px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🔐 Password Reset</h1>
                    </div>
                    <div class='content'>
                        <h2>Password Reset Request</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <p style='text-align: center;'>
                            <a href='{resetLink}' class='button'>Reset Password</a>
                        </p>
                        <div class='warning'>
                            <strong>⚠️ Security Notice:</strong><br>
                            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                        </div>
                        <p style='margin-top: 20px; font-size: 12px; color: #888;'>
                            This link will expire in 1 hour for security reasons.
                        </p>
                    </div>
                    <div class='footer'>
                        <p>© 2026 PIMS - Project Information Management System</p>
                    </div>
                </div>
            </body>
            </html>";

        return await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc/>
    public async Task<bool> SendNotificationEmailAsync(string toEmail, string title, string message)
    {
        var subject = $"PIMS Notification: {title}";
        
        var htmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .notification-box {{ background: white; border-left: 4px solid #11998e; padding: 20px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🔔 {title}</h1>
                    </div>
                    <div class='content'>
                        <div class='notification-box'>
                            <p>{message}</p>
                        </div>
                        <p style='text-align: center; margin-top: 20px;'>
                            <a href='https://your-domain.com' style='color: #11998e;'>Go to PIMS Dashboard →</a>
                        </p>
                    </div>
                    <div class='footer'>
                        <p>© 2026 PIMS - Project Information Management System</p>
                    </div>
                </div>
            </body>
            </html>";

        return await SendEmailAsync(toEmail, subject, htmlBody);
    }

    /// <inheritdoc/>
    public async Task<bool> SendVerificationEmailAsync(string toEmail, string userName, string verificationLink)
    {
        var subject = "PIMS - Verify Your Email Address";
        
        var htmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }}
                    .warning {{ background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin-top: 20px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>📧 Verify Your Email</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {userName}!</h2>
                        <p>Thank you for registering with PIMS. Please verify your email address by clicking the button below:</p>
                        <p style='text-align: center;'>
                            <a href='{verificationLink}' class='button'>✓ Verify My Email</a>
                        </p>
                        <div class='warning'>
                            <strong>ℹ️ Note:</strong><br>
                            This verification link will expire in <strong>24 hours</strong>.<br>
                            If you didn't create an account with PIMS, please ignore this email.
                        </div>
                        <p style='margin-top: 20px; font-size: 12px; color: #888;'>
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href='{verificationLink}' style='color: #667eea; word-break: break-all;'>{verificationLink}</a>
                        </p>
                    </div>
                    <div class='footer'>
                        <p>© 2026 PIMS - Project Information Management System</p>
                    </div>
                </div>
            </body>
            </html>";

        return await SendEmailAsync(toEmail, subject, htmlBody);
    }
    /// <inheritdoc/>
    public async Task<bool> SendPasswordResetOtpEmailAsync(string toEmail, string otpCode)
    {
        var subject = "PIMS - Password Reset OTP";
        
        var htmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #0f172a 0%, #020617 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }}
                    .otp-box {{ display: inline-block; background: white; border: 2px solid #22d3ee; color: #22d3ee; padding: 20px 40px; border-radius: 10px; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; }}
                    .warning {{ background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: left; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🔐 Password Reset OTP</h1>
                    </div>
                    <div class='content'>
                        <h2>Your Verification Code</h2>
                        <p>We received a request to reset your password. Use the following code to verify your identity:</p>
                        <div class='otp-box'>{otpCode}</div>
                        <p>This code will expire in 10 minutes.</p>
                        <div class='warning'>
                            <strong>⚠️ Security Notice:</strong><br>
                            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                        </div>
                    </div>
                    <div class='footer'>
                        <p>© 2026 PIMS - Project Information Management System</p>
                    </div>
                </div>
            </body>
            </html>";

        return await SendEmailAsync(toEmail, subject, htmlBody);
    }
}

