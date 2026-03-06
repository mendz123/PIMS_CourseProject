using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;
using PIMS_BE.Models.Chat;

namespace PIMS_BE.Repositories;

public class MessageRepository : GenericRepository<Message>, IMessageRepository
{
    public MessageRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Message>> GetConversationMessagesAsync(int conversationId, int count = 50)
    {
        return await _dbSet
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .OrderByDescending(m => m.CreatedAt)
            .Take(count)
            .Reverse()
            .ToListAsync();
    }
}
