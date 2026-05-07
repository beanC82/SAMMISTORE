using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IOrderDetailRepository : ICrudRepository<OrderDetail>
    {
        Task<IEnumerable<OrderDetail>> GetByOrderId(int orderId); 
    }
    public class OrderDetailRepository : CrudRepository<OrderDetail>, IOrderDetailRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public OrderDetailRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<IEnumerable<OrderDetail>> GetByOrderId(int orderId)
        {
            return await DbSet.Where(x => x.OrderId == orderId && x.IsDeleted != true).ToListAsync();
        }
    }
}
