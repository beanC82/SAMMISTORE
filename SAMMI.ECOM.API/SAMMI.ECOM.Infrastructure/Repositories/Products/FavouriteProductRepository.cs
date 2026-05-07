using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Products
{
    public interface IFavouriteProductRepository : ICrudRepository<FavouriteProduct>
    {
        Task<FavouriteProductDTO> GetByCustomerAndProduct(int customerId, int productId);
        Task<bool> IsExisted(int customerId, int productId);
        Task<List<int>> GetProductInFavourite(int customerId);
    }

    public class FavouriteProductRepository : CrudRepository<FavouriteProduct>, IFavouriteProductRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        private readonly IMapper _mapper;
        public FavouriteProductRepository(SammiEcommerceContext context, IMapper mapper) : base(context)
        {
            _context = context;
            _mapper = mapper;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<FavouriteProductDTO> GetByCustomerAndProduct(int customerId, int productId)
        {
            return _mapper.Map<FavouriteProductDTO>(await DbSet.SingleOrDefaultAsync(x => x.CustomerId == customerId && x.ProductId == productId && x.IsDeleted != true));
        }

        public Task<bool> IsExisted(int customerId, int productId)
        {
            return DbSet.AnyAsync(x => x.CustomerId == customerId && x.ProductId == productId && x.IsDeleted != true);
        }

        public Task<List<int>> GetProductInFavourite(int customerId)
        {
            return DbSet.Where(x => x.CustomerId == customerId && x.IsDeleted != true).Select(x => x.ProductId).ToListAsync();
        }
    }
}
