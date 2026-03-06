using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs.Chat;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;

namespace PIMS_BE.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            var conversations = await _chatService.GetUserConversationsAsync(userId);
            return Ok(conversations);
        }

        [HttpGet("conversations/{id}/messages")]
        public async Task<IActionResult> GetMessages(int id)
        {
            var messages = await _chatService.GetConversationMessagesAsync(id);
            return Ok(messages);
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            var message = await _chatService.SendMessageAsync(userId, request);
            return Ok(message);
        }

        [HttpPost("conversations/direct/{targetUserId}")]
        public async Task<IActionResult> GetOrCreateDirectConversation(int targetUserId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            var conversation = await _chatService.GetOrCreateDirectConversationAsync(userId, targetUserId);
            return Ok(conversation);
        }
    }
}
