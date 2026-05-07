using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IEventRepository : ICrudRepository<Event>
    {
        Task<bool> CheckExistCode(string code, int? id = 0);
        Task<bool> IsExistAnother(int id);
    }
    public class EventRepository : CrudRepository<Event>, IEventRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public EventRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CheckExistCode(string code, int? id = 0)
        {
            return await _context.Events.AnyAsync(x => x.Code.ToLower() == code.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public Task<bool> IsExistAnother(int id)
        {
            var query = from e in DbSet
                        join v in _context.Vouchers on e.Id equals v.EventId
                        where v.IsDeleted != true
                        join o in _context.Orders on v.Id equals o.VoucherId into og
                        from o in og.DefaultIfEmpty()
                        where o.IsDeleted != true
                        where e.Id == id
                        select new
                        {
                            e.Id
                        };
            return query.AnyAsync();
        }
    }
}
