using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IMessageRepository : ICrudRepository<Message>
    {
    }
    public class MessageRepository : CrudRepository<Message>, IMessageRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public MessageRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }
    }
}
