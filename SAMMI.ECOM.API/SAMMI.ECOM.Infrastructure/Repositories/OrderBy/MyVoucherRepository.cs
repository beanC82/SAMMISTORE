using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IMyVoucherRepository : ICrudRepository<MyVoucher>
    {
        Task<bool> IsExisted(int voucherId, int customerId);
        Task<MyVoucher> GetDataByVoucherAndCustomer(int voucherId, int customerId);
    }
    public class MyVoucherRepository : CrudRepository<MyVoucher>, IMyVoucherRepository, IDisposable
    {
        private bool _disposed;
        public MyVoucherRepository(SammiEcommerceContext context) : base(context)
        {
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<MyVoucher> GetDataByVoucherAndCustomer(int voucherId, int customerId)
        {
            return await DbSet.SingleOrDefaultAsync(x => x.VoucherId == voucherId && x.CustomerId == customerId && x.IsDeleted != true);
        }

        public async Task<bool> IsExisted(int voucherId, int customerId)
        {
            return await DbSet.SingleOrDefaultAsync(x => x.VoucherId == voucherId && x.CustomerId == customerId && x.IsDeleted != true) != null;
        }
    }
}
