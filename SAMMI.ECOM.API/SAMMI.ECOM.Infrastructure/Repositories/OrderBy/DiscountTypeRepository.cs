using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IDiscountTypeRepository : ICrudRepository<DiscountType>
    {
    }
    public class DiscountTypeRepository : CrudRepository<DiscountType>, IDiscountTypeRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public DiscountTypeRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }
    }
}
