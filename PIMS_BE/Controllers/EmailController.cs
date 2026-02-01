using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.Helpers;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>
/// Controller for testing email functionality
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailController> _logger;

    public EmailController(IEmailService emailService, ILogger<EmailController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Send a test email to verify email configuration
    /// </summary>
    /// <param name="toEmail">Recipient email address</param>
    /// <returns>Success or failure response</returns>
    [HttpPost("send-test")]
    public async Task<ActionResult<ApiResponse<bool>>> SendTestEmail([FromQuery] string toEmail)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Email address is required"));
        }

        _logger.LogInformation("Sending test email to {Email}", toEmail);

        var result = await _emailService.SendEmailAsync(
            toEmail,
            "PIMS Test Email",
            @"
            <html>
            <body style='font-family: Arial, sans-serif; padding: 20px;'>
                <h1 style='color: #667eea;'>🎉 Email Test Successful!</h1>
                <p>If you receive this email, your PIMS email configuration is working correctly.</p>
                <p style='color: #888; margin-top: 30px;'>This is an automated test email from PIMS System.</p>
            </body>
            </html>"
        );

        if (result)
        {
            return Ok(ApiResponse<bool>.Ok(true, $"Test email sent successfully to {toEmail}"));
        }

        return StatusCode(500, ApiResponse<bool>.InternalError("Failed to send email. Check server logs for details."));
    }

    /// <summary>
    /// Test welcome email template
    /// </summary>
    [HttpPost("send-welcome")]
    public async Task<ActionResult<ApiResponse<bool>>> SendWelcomeEmail([FromQuery] string toEmail, [FromQuery] string userName = "Test User")
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            return BadRequest(ApiResponse<bool>.BadRequest("Email address is required"));
        }

        var result = await _emailService.SendWelcomeEmailAsync(toEmail, userName);

        if (result)
        {
            return Ok(ApiResponse<bool>.Ok(true, $"Welcome email sent to {toEmail}"));
        }

        return StatusCode(500, ApiResponse<bool>.InternalError("Failed to send welcome email"));
    }
    // [HttpPost("send-verifyCode")]
    // public async Task<ActionResult<ApiResponse<bool>>> SendVerifyCode([FromBody] SendVerificationCodeRequest request)
    // {
    //     var result = await _emailService.SendVerificationCodeAsync(request);
    //     if (result)
    //     {
    //         return Ok(ApiResponse<bool>.Ok(true, "Verification code sent successfully"));
    //     }
    //     return StatusCode(500, ApiResponse<bool>.InternalError("Failed to send verification code"));
    // }
}

