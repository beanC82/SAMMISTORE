using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Products
{
    public interface IProductRepository : ICrudRepository<Product>
    {
        Task<bool> IsExistCode(string code, int? id = 0);
        Task<decimal> CalAmount(int productId, int quantity);
        Task<decimal> GetPrice(int productId);
        Task<ActionResponse> RollbackProduct(int orderId);
        Task<int> TotalProductAsync();
        Task<ActionResponse> IsExistAnotherTable(int productId);
    }

    public class ProductRepository : CrudRepository<Product>, IProductRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        private readonly Lazy<IOrderDetailRepository> _orderDetailRepository;
        public ProductRepository(SammiEcommerceContext context,
            Lazy<IOrderDetailRepository> orderDetailRepository) : base(context)
        {
            _context = context;
            _orderDetailRepository = orderDetailRepository;
        }

        public async Task<decimal> CalAmount(int productId, int quantity)
        {
            var product = await GetByIdAsync(productId);
            if (product == null)
                return 0;
            return quantity *
                (product.StartDate <= DateTime.Now && product.EndDate >= DateTime.Now
                    ? (decimal)(product.Price * (1 - product.Discount))
                    : product.Price);
        }

        public async Task<decimal> GetPrice(int productId)
        {
            var product = await GetByIdAsync(productId);
            if (product == null)
                return 0;
            return (product.StartDate <= DateTime.Now && product.EndDate >= DateTime.Now
                    ? (decimal)(product.Price * (1 - product.Discount))
                    : product.Price);
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<bool> IsExistCode(string code, int? id = 0)
        {
            return await DbSet.AnyAsync(x => x.Code.ToLower() == code.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public async Task<ActionResponse> RollbackProduct(int orderId)
        {
            var actRes = new ActionResponse();
            var details = await _orderDetailRepository.Value.GetByOrderId(orderId);
            foreach (var de in details)
            {
                var product = await FindById(de.ProductId);
                product.StockQuantity += de.Quantity;
                actRes.Combine(Update(product));
                if (!actRes.IsSuccess)
                {
                    return actRes;
                }
            }
            await SaveChangeAsync();
            return actRes;
        }

        public async Task<int> TotalProductAsync()
        {
            return await DbSet.CountAsync(x => x.IsDeleted != true);
        }

        public async Task<ActionResponse> IsExistAnotherTable(int productId)
        {
            var actionRes = new ActionResponse();
            var result = false;
            var message = "Không thể xóa sản phẩm! ";
            if (await _context.CartDetails.AnyAsync(x => x.ProductId == productId && x.IsDeleted != true))
            {
                actionRes.AddError($"{message}Sản phẩm có id {productId} đang có trong giỏ hàng.");
                return actionRes;
            }
            if(await _context.OrderDetails.AnyAsync(x => x.ProductId == productId && x.IsDeleted != true))
            {
                actionRes.AddError($"{message}Sản phẩm có id {productId} đã được bán");
                return actionRes;
            }
            if (await _context.PurchaseOrderDetails.AnyAsync(x => x.ProductId == productId && x.IsDeleted != true))
            {
                actionRes.AddError($"{message}Sản phẩm có id {productId} đã tồn tại trong phiếu nhập hàng");
                return actionRes;
            }
            return actionRes;
        }
    }
}
