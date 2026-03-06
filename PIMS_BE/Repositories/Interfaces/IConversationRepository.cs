using PIMS_BE.Models.Chat;

namespace PIMS_BE.Repositories;

public interface IConversationRepository : IGenericRepository<Conversation>
{
    Task<IEnumerable<Conversation>> GetUserConversationsAsync(int userId);
    Task<Conversation?> GetConversationWithParticipantsAsync(int conversationId);
}
