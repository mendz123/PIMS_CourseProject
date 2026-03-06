using PIMS_BE.Models.Chat;

namespace PIMS_BE.Repositories;

public interface IMessageRepository : IGenericRepository<Message>
{
    Task<IEnumerable<Message>> GetConversationMessagesAsync(int conversationId, int count = 50);
}
