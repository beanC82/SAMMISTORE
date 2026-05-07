using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IReviewRepository : ICrudRepository<Review>
    {
        Task<bool> IsExisted(int orderId, int productId, int userId);
        Task<bool> IsExisted(int userId, int reviewId);
    }
    public class ReviewRepository : CrudRepository<Review>, IReviewRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public ReviewRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public Task<bool> IsExisted(int orderId, int productId, int userId)
        {
            var query = from r in _context.Reviews
                        join u in _context.Users on r.UserId equals u.Id
                        join o in _context.Orders on u.Id equals o.CustomerId into ougroup
                        from o in ougroup.DefaultIfEmpty()
                        where r.ProductId == productId && o.CustomerId == userId && o.Id == orderId
                        select r.Id;
            return query.AnyAsync();
        }

        public Task<bool> IsExisted(int userId, int reviewId)
        {
            return DbSet.Where(r => r.Id == reviewId && r.UserId == userId).AnyAsync();
        }
    }
}
