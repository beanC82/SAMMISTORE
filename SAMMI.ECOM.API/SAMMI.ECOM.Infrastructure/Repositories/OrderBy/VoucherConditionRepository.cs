using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IVoucherConditionRepository : ICrudRepository<VoucherCondition>
    {
        Task<IEnumerable<VoucherCondition>> GetByVoucherId(int voucherId);
    }
    public class VoucherConditionRepository : CrudRepository<VoucherCondition>, IVoucherConditionRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public VoucherConditionRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }


        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<IEnumerable<VoucherCondition>> GetByVoucherId(int voucherId)
        {
            return await DbSet.Where(x => x.VoucherId == voucherId && x.IsDeleted != true).ToListAsync();
        }
    }
}
