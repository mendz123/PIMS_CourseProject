using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Notification;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;

namespace PIMS_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetMyNotifications([FromQuery] bool? unreadOnly)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var data = await _notificationService.GetNotificationsForUserAsync(userId, unreadOnly);
            return OkResponse(data, "Notifications retrieved successfully");
        }
        catch (Exception ex)
        {
            return InternalErrorResponse<List<NotificationDto>>(ex.Message);
        }
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        try
        {
            var userId = GetUserIdFromToken();
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return OkResponse(count, "Unread count retrieved successfully");
        }
        catch (Exception ex)
        {
            return InternalErrorResponse<int>(ex.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<NotificationDto>>> CreateNotification([FromBody] CreateNotificationRequest request)
    {
        try
        {
            if (request == null || (string.IsNullOrWhiteSpace(request.Title) && string.IsNullOrWhiteSpace(request.Content)))
            {
                return BadRequestResponse<NotificationDto>("Title or content is required");
            }

            var userId = GetUserIdFromToken();
            var created = await _notificationService.CreateNotificationAsync(userId, request);
            return CreatedResponse(created, "Notification created successfully");
        }
        catch (Exception ex)
        {
            return InternalErrorResponse<NotificationDto>(ex.Message);
        }
    }

    [HttpPut("{id:int}/read")]
    public async Task<ActionResult<ApiResponse<NotificationDto>>> MarkAsRead(int id)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var updated = await _notificationService.MarkAsReadAsync(userId, id);

            if (updated == null)
            {
                return NotFoundResponse<NotificationDto>("Notification not found");
            }

            return OkResponse(updated, "Notification marked as read");
        }
        catch (Exception ex)
        {
            return InternalErrorResponse<NotificationDto>(ex.Message);
        }
    }

    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<int>>> MarkAllAsRead()
    {
        try
        {
            var userId = GetUserIdFromToken();
            var updatedCount = await _notificationService.MarkAllAsReadAsync(userId);
            return OkResponse(updatedCount, "All notifications marked as read");
        }
        catch (Exception ex)
        {
            return InternalErrorResponse<int>(ex.Message);
        }
    }

    private int GetUserIdFromToken()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập hoặc Token không hợp lệ.");
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new Exception("Không tìm thấy UserId trong Token.");
        }

        return int.Parse(userIdClaim);
    }
}
