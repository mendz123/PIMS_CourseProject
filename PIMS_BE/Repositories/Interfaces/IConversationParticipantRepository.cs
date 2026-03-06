using PIMS_BE.Models.Chat;

namespace PIMS_BE.Repositories;

public interface IConversationParticipantRepository : IGenericRepository<ConversationParticipant>
{
    Task<ConversationParticipant?> GetParticipantAsync(int conversationId, int userId);
    Task<IEnumerable<ConversationParticipant>> GetConversationParticipantsAsync(int conversationId);
}
