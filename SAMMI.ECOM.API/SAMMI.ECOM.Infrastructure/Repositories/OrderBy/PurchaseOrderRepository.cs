using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Nest;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IPurchaseOrderRepository : ICrudRepository<PurchaseOrder>
    {
        Task<ActionResponse> UpdateStatus(int id, PurchaseOrderStatus status);
        Task<bool> IsExistedCode(string code, int? id = 0);
    }
    public class PurchaseOrderRepository : CrudRepository<PurchaseOrder>, IPurchaseOrderRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        private readonly Lazy<IPurchaseOrderDetailRepository> _detailRepository;
        private readonly Lazy<IProductRepository> _productRepository;
        public PurchaseOrderRepository(
            SammiEcommerceContext context,
            Lazy<IPurchaseOrderDetailRepository> detailRepository,
            Lazy<IProductRepository> productRepository,
            UserIdentity currentUser) : base(context)
        {
            _context = context;
            UserIdentity = currentUser;
            _detailRepository = detailRepository;
            _productRepository = productRepository;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        private bool IsValidStatusTransaction(PurchaseOrderStatus currentStatus, PurchaseOrderStatus newStatus)
        {
            switch (currentStatus)
            {
                case PurchaseOrderStatus.Draft:
                    return newStatus == PurchaseOrderStatus.PendingApproval || newStatus == PurchaseOrderStatus.Canceled;
                case PurchaseOrderStatus.PendingApproval:
                    return newStatus == PurchaseOrderStatus.Approved || newStatus == PurchaseOrderStatus.Canceled;
                case PurchaseOrderStatus.Approved:
                    return newStatus == PurchaseOrderStatus.Processing || newStatus == PurchaseOrderStatus.Canceled;
                case PurchaseOrderStatus.Processing:
                    return newStatus == PurchaseOrderStatus.Completed || newStatus == PurchaseOrderStatus.Canceled;
                case PurchaseOrderStatus.Completed:
                    return false;
                case PurchaseOrderStatus.Canceled:
                    return false;
                default:
                    return false;
            }
        }

        public async Task<ActionResponse> UpdateStatus(int id, PurchaseOrderStatus status)
        {
            var actRes = new ActionResponse();
            var purchase = await GetByIdAsync(id);
            if (Enum.TryParse<PurchaseOrderStatus>(purchase.Status, true, out PurchaseOrderStatus currentStatus)
                && IsValidStatusTransaction(currentStatus, status))
            {
                purchase.Status = status.ToString();
                purchase.UpdatedBy = UserIdentity.UserName;
                purchase.UpdatedDate = DateTime.Now;
                actRes.Combine(await UpdateAndSave(purchase));
                if (!actRes.IsSuccess)
                    return actRes;

                // cập nhật sản phẩm
                if(status == PurchaseOrderStatus.Completed)
                {
                    var purchaseDetails = await _detailRepository.Value.GetByPurchaseOrderId(purchase.Id);
                    foreach (var detail in purchaseDetails)
                    {
                        var product = await _productRepository.Value.FindById(detail.ProductId);
                        if (product != null)
                        {
                            product.StockQuantity = product.StockQuantity == null ? 0 : product.StockQuantity;
                            product.StockQuantity += detail.Quantity;
                            if(product.Status == 2)
                            {
                                product.Status = 0;
                                product.ImportPrice = detail.UnitPrice;
                            }
                            actRes.Combine(_productRepository.Value.Update(product));
                            if (!actRes.IsSuccess)
                            {
                                return actRes;
                            }
                        }
                    }

                    await _productRepository.Value.SaveChangeAsync();
                }
            }
            else
            {
                actRes.AddError("Trạng thái cập nhật không hợp lệ.");
            }
            return actRes;
        }

        public Task<bool> IsExistedCode(string code, int? id = 0)
        {
            return DbSet.AnyAsync(x => x.Code == code && x.Id != id && x.IsDeleted != true);
        }
    }
}
