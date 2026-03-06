using Microsoft.EntityFrameworkCore;
using PIMS_BE.Models;
using PIMS_BE.Models.Chat;

namespace PIMS_BE.Repositories;

public class ConversationParticipantRepository : GenericRepository<ConversationParticipant>, IConversationParticipantRepository
{
    public ConversationParticipantRepository(PimsDbContext context) : base(context)
    {
    }

    public async Task<ConversationParticipant?> GetParticipantAsync(int conversationId, int userId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.ConversationId == conversationId && p.UserId == userId);
    }

    public async Task<IEnumerable<ConversationParticipant>> GetConversationParticipantsAsync(int conversationId)
    {
        return await _dbSet
            .Where(p => p.ConversationId == conversationId && !p.IsDeleted)
            .ToListAsync();
    }
}
