using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.Chat;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Chat
{
    public interface IAiChatHistoryRepository : ICrudRepository<AiChatHistory>
    {
        Task<List<AiChatHistory>> GetByConversationIdAsync(string conversationId);
        Task<List<AiChatHistory>> GetByUserIdAsync(int userId, int limit = 20);
    }

    public class AiChatHistoryRepository : CrudRepository<AiChatHistory>, IAiChatHistoryRepository
    {
        private readonly SammiEcommerceContext _context;

        public AiChatHistoryRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<AiChatHistory>> GetByConversationIdAsync(string conversationId)
        {
            return await DbSet.AsNoTracking()
                .Where(x => x.ConversationId == conversationId && !x.IsDeleted)
                .OrderBy(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<List<AiChatHistory>> GetByUserIdAsync(int userId, int limit = 20)
        {
            return await DbSet.AsNoTracking()
                .Where(x => x.UserId == userId && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .Take(limit)
                .OrderBy(x => x.CreatedDate)
                .ToListAsync();
        }
    }
}
