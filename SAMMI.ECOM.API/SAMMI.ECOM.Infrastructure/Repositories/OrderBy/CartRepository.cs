using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface ICartRepository : ICrudRepository<Cart>
    {
        Task<Cart> GetByCustomerId(int customerId);
    }
    public class CartRepository : CrudRepository<Cart>, ICartRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public CartRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<Cart> GetByCustomerId(int customerId)
        {
            return await _context.Carts.SingleOrDefaultAsync(x => x.CustomerId == customerId && x.IsDeleted != true);
        }
    }
}
