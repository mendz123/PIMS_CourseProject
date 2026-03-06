using PIMS_BE.DTOs.Chat;
using PIMS_BE.Models.Chat;

namespace PIMS_BE.Services.Interfaces
{
    public interface IChatService
    {
        Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId);
        Task<IEnumerable<MessageDto>> GetConversationMessagesAsync(int conversationId, int count = 50);
        Task<MessageDto> SendMessageAsync(int senderId, SendMessageRequest request);
        Task<ConversationDto> GetOrCreateDirectConversationAsync(int user1Id, int user2Id);
        Task<ConversationDto> CreateGroupConversationAsync(int creatorId, string name, List<int> participantIds);
    }
}
