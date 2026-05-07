using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Infrastructure.Queries.Auth;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IPurchaseOrderDetailRepository : ICrudRepository<PurchaseOrderDetail>
    {
        Task<IEnumerable<PurchaseOrderDetailCommand>> GetByPurchaseOrderId(int purchaseOrderId);
    }
    public class PurchaseOrderDetailRepository : CrudRepository<PurchaseOrderDetail>, IPurchaseOrderDetailRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        private readonly IMapper _mapper;
        public PurchaseOrderDetailRepository(SammiEcommerceContext context,
            IMapper mapper) : base(context)
        {
            _context = context;
            _mapper = mapper;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<IEnumerable<PurchaseOrderDetailCommand>> GetByPurchaseOrderId(int purchaseOrderId)
        {
            var details = await DbSet.Where(x => x.PurchaseOrderId == purchaseOrderId && x.IsDeleted != true).ToListAsync();
            return _mapper.Map<IEnumerable<PurchaseOrderDetailCommand>>(details);
        }
    }
}
