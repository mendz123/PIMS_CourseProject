using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;
using PIMS_BE.Models.Chat;

namespace PIMS_BE.Repositories;

public class ConversationRepository : GenericRepository<Conversation>, IConversationRepository
{
    public ConversationRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Conversation>> GetUserConversationsAsync(int userId)
    {
        return await _dbSet
            .Include(c => c.ConversationParticipants)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
            .Where(c => c.ConversationParticipants.Any(p => p.UserId == userId && !p.IsDeleted))
            .OrderByDescending(c => c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.CreatedAt).FirstOrDefault())
            .ToListAsync();
    }

    public async Task<Conversation?> GetConversationWithParticipantsAsync(int conversationId)
    {
        return await _dbSet
            .Include(c => c.ConversationParticipants)
            .FirstOrDefaultAsync(c => c.Id == conversationId);
    }
}
