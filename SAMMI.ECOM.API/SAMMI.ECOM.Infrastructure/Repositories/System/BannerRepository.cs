using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.System
{
    public interface IBannerRepository : ICrudRepository<Banner>
    {
    }
    public class BannerRepository : CrudRepository<Banner>, IBannerRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public BannerRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }
    }
}
