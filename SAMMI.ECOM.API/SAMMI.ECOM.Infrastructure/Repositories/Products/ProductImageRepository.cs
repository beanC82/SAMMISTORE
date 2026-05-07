using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Products
{
    public interface IProductImageRepository : ICrudRepository<ProductImage>
    {
        Task<ActionResponse> DeleteData(int productId, int imageId);
    }

    public class ProductImageRepository : CrudRepository<ProductImage>, IProductImageRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public ProductImageRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public async Task<ActionResponse> DeleteData(int productId, int imageId)
        {
            var pi = await DbSet.SingleOrDefaultAsync(x => x.ProductId == productId && x.ImageId == imageId && x.IsDeleted != true);
            if (pi == null)
                return new ActionResponse().AddError("Hình ảnh sản phẩm không tồn tại");
            return DeleteAndSave(pi.Id);
        }

        public void Dispose()
        {
            _disposed = true;
        }
    }
}
