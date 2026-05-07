using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IPaymentMethodRepository : ICrudRepository<PaymentMethod>
    {
        Task<bool> CheckExistName(string name, int? id = 0);

        Task<PaymentMethod> GetByCode(string code);
    }

    public class PaymentMethodRepository : CrudRepository<PaymentMethod>, IPaymentMethodRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;

        public PaymentMethodRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CheckExistName(string name, int? id = 0)
        {
            return await _context.PaymentMethods.AnyAsync(x => x.Name.ToLower() == name.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<PaymentMethod> GetByCode(string code)
        {
            return await _context.PaymentMethods.SingleOrDefaultAsync(x => x.Code.ToLower() == code.ToLower() && x.IsDeleted != true);
        }
    }
}