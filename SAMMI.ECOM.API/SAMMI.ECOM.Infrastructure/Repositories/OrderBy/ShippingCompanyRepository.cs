using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IShippingCompanyRepository : ICrudRepository<ShippingCompany>
    {
        Task<ShippingCompany> GetShipDefault();
    }
    public class ShippingCompanyRepository : CrudRepository<ShippingCompany>, IShippingCompanyRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public ShippingCompanyRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<ShippingCompany> GetShipDefault()
        {
            return await DbSet.FirstOrDefaultAsync(x => x.IsDefault == true);
        }
    }
}
