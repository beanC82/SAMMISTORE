using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.Reports;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.OrderBy
{
    public interface IOrderRepository : ICrudRepository<Order>
    {
        Task<OrderDTO> GetByCode(int? id = 0, string? code = null);

        Task<ActionResponse<Order>> UpdateStatus(OrderStatusEnum status, int? id = 0, string? code = null);

        Task<decimal> CalculateTotalPrice(int orderId);

        Task<ActionResponse> UpdateOrderStatus(int id, OrderStatusEnum newStatus, TypeUserEnum type, string? code = null);

        Task<ActionResponse> UpdateOrderStatus(UpdateOrderStatusCommand orderStatus);

        Task<ActionResponse> CancelldOrder(int orderId);

        Task<Order> FindByCode(string code);

        Task<NumberOfOrders> GetNumberOrder();

        Task<bool> IsExisted(int orderId, int customerId);

        Task<int> TotalOrderAsync();
        Task<Dictionary<string, int>> GetOrderStatusSummaryAsync();
    }

    public class OrderRepository : CrudRepository<Order>, IOrderRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        private readonly IMapper _mapper;
        private readonly Lazy<IVoucherRepository> _voucherRepository;
        private readonly Lazy<IPaymentRepository> _paymentRepository;
        private readonly Lazy<IRoleRepository> _roleRepository;
        private readonly Lazy<IProductRepository> _productRepository;
        private readonly UserIdentity _currentUser;

        public OrderRepository(
            SammiEcommerceContext context,
            Lazy<IVoucherRepository> voucherRepository,
            Lazy<IPaymentRepository> paymentRepository,
            Lazy<IRoleRepository> roleRepository,
            Lazy<IProductRepository> productRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(context)
        {
            _context = context;
            _mapper = mapper;
            _voucherRepository = voucherRepository;
            _paymentRepository = paymentRepository;
            _currentUser = currentUser;
            _roleRepository = roleRepository;
            _productRepository = productRepository;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<OrderDTO> GetByCode(int? id = 0, string? code = null)
        {
            var orderQuery = from t1 in _context.Orders
                             join t2 in _context.OrderDetails on t1.Id equals t2.OrderId
                             join t3 in _context.Users on t1.CustomerId equals t3.Id
                             join t4 in _context.Products on t2.ProductId equals t4.Id
                             join t5 in _context.Payments on t1.Id equals t5.OrderId
                             where
                                !string.IsNullOrEmpty(code)
                                ? t1.Code.ToLower() == code.ToLower()
                                : t1.Id == id
                                && t1.IsDeleted != true
                                && t2.IsDeleted != true
                                && t3.IsDeleted != true && t3.IsActive == true
                                && t4.IsDeleted != true && t4.IsActive == true
                                && t5.IsDeleted != true
                             group new { t2, t4 } by new
                             {
                                 t1.Id,
                                 t1.Code,
                                 t5.PaymentStatus,
                                 t1.OrderStatus,
                                 t1.ShippingStatus,
                                 t1.VoucherId,
                                 t1.CustomerAddress,
                                 t1.CreatedDate,
                                 t1.CreatedBy,
                                 t1.UpdatedBy,
                                 t1.UpdatedDate,
                                 t1.IsActive,
                                 t1.IsDeleted,
                                 t1.DisplayOrder,
                                 t1.CustomerId,
                                 t3.FullName,
                                 t3.Phone
                             } into gr
                             select new OrderDTO
                             {
                                 Code = gr.Key.Code,
                                 CustomerId = gr.Key.CustomerId,
                                 CustomerName = gr.Key.FullName,
                                 PhoneNumber = gr.Key.Phone,
                                 PaymentStatus = gr.Key.PaymentStatus,
                                 OrderStatus = gr.Key.OrderStatus,
                                 ShippingStatus = gr.Key.ShippingStatus,
                                 VoucherId = gr.Key.VoucherId,
                                 CustomerAddress = gr.Key.CustomerAddress,
                                 Id = gr.Key.Id,
                                 CreatedDate = gr.Key.CreatedDate,
                                 UpdatedDate = gr.Key.UpdatedDate,
                                 CreatedBy = gr.Key.CreatedBy,
                                 UpdatedBy = gr.Key.UpdatedBy,
                                 IsActive = gr.Key.IsActive,
                                 IsDeleted = gr.Key.IsDeleted,
                                 DisplayOrder = gr.Key.DisplayOrder,
                                 TotalPrice = gr.Sum(x => x.t2.Quantity *
                                    (x.t4.StartDate <= DateTime.Now && x.t4.EndDate >= DateTime.Now
                                    ? x.t4.Price * (1 - x.t4.Discount) : x.t4.Price)),
                                 TotalQuantity = gr.Sum(x => x.t2.Quantity)
                             };

            return await orderQuery.FirstOrDefaultAsync();
        }

        public async Task<Order> FindByCode(string code)
        {
            return await DbSet.FirstOrDefaultAsync(x => x.Code.ToLower() == code.ToLower() && x.IsDeleted != true);
        }

        public async Task<ActionResponse<Order>> UpdateStatus(OrderStatusEnum status, int? id = 0, string? code = null)
        {
            Order order = null;
            if (!string.IsNullOrEmpty(code))
            {
                order = await FindByCode(code);
            }
            else
            {
                order = await FindById(id);
            }

            if (order == null)
                return null;
            order.OrderStatus = status.ToString();
            order.UpdatedDate = DateTime.Now;
            order.UpdatedBy = "System";
            var updateRes = await UpdateAndSave(order);
            return updateRes;
        }

        /// <summary>
        /// Tính tất cả phí giảm và được giảm
        /// </summary>
        /// <param name="orderId"></param>
        /// <returns></returns>
        public async Task<decimal> CalculateTotalPrice(int orderId)
        {
            var order = await GetByCode(id: orderId);
            if (order == null)
                return 0;
            decimal amount = order.TotalPrice ?? 0;
            amount += order.CostShip ?? 0;

            if (order.VoucherId != null && order.VoucherId == 0)
            {
                var totalDiscount = await _voucherRepository.Value.CalculateDiscount(order.VoucherId ?? 0, order.CostShip ?? 0, order.TotalPrice ?? 0);
                amount -= totalDiscount;
            }
            return amount;
        }

        private bool IsValidOrderStatus(OrderStatusEnum currentStatus, OrderStatusEnum newStatus, TypeUserEnum? type = TypeUserEnum.Employee)
        {
            switch (currentStatus)
            {
                case OrderStatusEnum.Pending:
                    return newStatus == OrderStatusEnum.WaitingForPayment || newStatus == OrderStatusEnum.Cancelled;

                case OrderStatusEnum.WaitingForPayment:
                    return newStatus == OrderStatusEnum.Processing || newStatus == OrderStatusEnum.Cancelled;

                case OrderStatusEnum.Processing:
                    if (type == TypeUserEnum.Employee)
                        return newStatus == OrderStatusEnum.WaitingForPayment || newStatus == OrderStatusEnum.Cancelled;
                    return newStatus == OrderStatusEnum.WaitingForPayment;

                case OrderStatusEnum.Completed:
                    return false;

                case OrderStatusEnum.Cancelled:
                    return false;

                default:
                    return false;
            }
        }

        public async Task<ActionResponse> UpdateOrderStatus(int id, OrderStatusEnum newStatus, TypeUserEnum type, string? code = null)
        {
            var actRes = new ActionResponse();
            Order order = null;
            if (string.IsNullOrEmpty(code))
                order = await GetByIdAsync(id);
            else
                order = await FindByCode(code);
            if (order != null
                && Enum.TryParse<OrderStatusEnum>(order.OrderStatus, true, out OrderStatusEnum currentStatus)
                && IsValidOrderStatus(currentStatus, newStatus, type))
            {
                order.OrderStatus = newStatus.ToString();
                order.ShippingStatus = newStatus == OrderStatusEnum.Completed
                    ? ShippingStatusEnum.Delivered.ToString()
                    : order.ShippingStatus;
                order.UpdatedDate = DateTime.Now;
                order.UpdatedBy = type == TypeUserEnum.Customer ? "Customer" : UserIdentity.UserName;
                actRes.Combine(await UpdateAndSave(order));
                if (!actRes.IsSuccess)
                {
                    return actRes;
                }
                if (newStatus == OrderStatusEnum.Completed)
                {
                    var payment = await _paymentRepository.Value.GetByIdAsync(id);
                    payment.PaymentStatus = PaymentStatusEnum.Paid.ToString();
                    payment.UpdatedDate = DateTime.Now;
                    payment.UpdatedBy = type == TypeUserEnum.Customer ? "Customer" : UserIdentity.UserName;
                    actRes.Combine(await _paymentRepository.Value.UpdateAndSave(payment));
                }
                else if (newStatus == OrderStatusEnum.Cancelled)
                {
                    actRes.Combine(await _productRepository.Value.RollbackProduct(order.Id));
                    if (!actRes.IsSuccess)
                    {
                        return actRes;
                    }
                    if (order.VoucherId != null)
                    {
                        actRes.Combine(await _voucherRepository.Value.RollbackVoucher(order.VoucherId ?? 0, order.CustomerId));
                    }
                }
            }
            else
            {
                actRes.AddError("Trạng thái đơn hàng không hợp lệ.");
            }
            return actRes;
        }

        private bool IsValidShippingStatus(ShippingStatusEnum currentStatus, ShippingStatusEnum newStatus)
        {
            return (currentStatus, newStatus) switch
            {
                (ShippingStatusEnum.NotShipped, ShippingStatusEnum.Processing) => true,
                (ShippingStatusEnum.Processing, ShippingStatusEnum.Delivered) => true,
                (ShippingStatusEnum.Processing, ShippingStatusEnum.Lost) => true,
                (ShippingStatusEnum.NotShipped, ShippingStatusEnum.Lost) => true,
                _ => false
            };
        }

        public async Task<ActionResponse> UpdateOrderStatus(UpdateOrderStatusCommand orderStatus)
        {
            var actRes = new ActionResponse();
            var order = await GetByIdAsync(orderStatus.OrderId);
            if (Enum.TryParse<ShippingStatusEnum>(order.ShippingStatus, true, out ShippingStatusEnum currentShip)
                && order.WardId != null
                && !IsValidShippingStatus(currentShip, orderStatus.ShippingStatus))
            {
                actRes.AddError("Trạng thái vận chuyển không hợp lệ");
                return actRes;
            }


            var payment = await _paymentRepository.Value.GetByOrderCode(order.Code);
            if (Enum.TryParse<PaymentStatusEnum>(payment.PaymentStatus, true, out PaymentStatusEnum currentPayment)
                && !_paymentRepository.Value.IsValidPaymentStatus(currentPayment, orderStatus.PaymentStatus))
            {
                actRes.AddError("Trạng thái thanh toán không hợp lệ");
                return actRes;
            }

            order.OrderStatus = (orderStatus.PaymentStatus, orderStatus.ShippingStatus) switch
            {
                (PaymentStatusEnum.Paid, ShippingStatusEnum.Processing) => OrderStatusEnum.Processing.ToString(),
                (PaymentStatusEnum.Paid, ShippingStatusEnum.NotShipped) => OrderStatusEnum.Completed.ToString(), //new
                (PaymentStatusEnum.Paid, ShippingStatusEnum.Delivered) => OrderStatusEnum.Completed.ToString(),
                (PaymentStatusEnum.Paid, ShippingStatusEnum.Lost) => OrderStatusEnum.Cancelled.ToString(),
                (PaymentStatusEnum.Unpaid, ShippingStatusEnum.Processing) => OrderStatusEnum.Processing.ToString(),
                (PaymentStatusEnum.Unpaid, ShippingStatusEnum.Lost) => OrderStatusEnum.Cancelled.ToString(),
                (PaymentStatusEnum.Failed, ShippingStatusEnum.Lost) => OrderStatusEnum.Cancelled.ToString(),
                _ => null
            };

            if (order.OrderStatus == null)
            {
                actRes.AddError("Cập nhật trạng thái đơn hàng không hợp lệ.");
                return actRes;
            }
            order.ShippingStatus = orderStatus.ShippingStatus.ToString();
            order.UpdatedBy = _currentUser.UserName;
            order.UpdatedDate = DateTime.Now;
            actRes.Combine(await UpdateAndSave(order));
            if (!actRes.IsSuccess)
            {
                return actRes;
            }
            payment.PaymentStatus = orderStatus.PaymentStatus.ToString();
            payment.UpdatedBy = _currentUser.UserName;
            payment.UpdatedDate = DateTime.Now;
            actRes.Combine(await _paymentRepository.Value.UpdateAndSave(payment));

            if (order.OrderStatus == OrderStatusEnum.Cancelled.ToString())
            {
                actRes.Combine(await _productRepository.Value.RollbackProduct(order.Id));
                if (!actRes.IsSuccess)
                {
                    return actRes;
                }
                if (order.VoucherId != null)
                {
                    actRes.Combine(await _voucherRepository.Value.RollbackVoucher(order.VoucherId ?? 0, order.CustomerId));
                }
            }
            return actRes;
        }

        public async Task<ActionResponse> CancelldOrder(int orderId)
        {
            var actResponse = new ActionResponse();
            var order = await GetByIdAsync(orderId);
            var paymentStatus = await _paymentRepository.Value.GetByOrderCode(order.Code);
            var role = await _roleRepository.Value.GetByIdAsync(_currentUser.Roles.FirstOrDefault());

            if (role.Code != RoleTypeEnum.MANAGER.ToString() &&
                role.Code != RoleTypeEnum.ADMIN.ToString())
            {
                if (paymentStatus.PaymentStatus == PaymentStatusEnum.Paid.ToString())
                {
                    actResponse.AddError("Đơn hàng đã thanh toán không thể hủy.");
                    return actResponse;
                }
                if (order.ShippingStatus == ShippingStatusEnum.Processing.ToString() ||
                    order.ShippingStatus == ShippingStatusEnum.Delivered.ToString())
                {
                    actResponse.AddError("Đơn hàng đang được xử lý hoặc đã giao không thể hủy.");
                    return actResponse;
                }
            }

            order.OrderStatus = OrderStatusEnum.Cancelled.ToString();
            order.UpdatedDate = DateTime.Now;
            order.UpdatedBy = _currentUser.UserName;
            actResponse.Combine(await UpdateAndSave(order));
            if (!actResponse.IsSuccess)
            {
                return actResponse;
            }

            actResponse.Combine(await _productRepository.Value.RollbackProduct(orderId));
            if (!actResponse.IsSuccess)
            {
                return actResponse;
            }
            if (order.VoucherId != null)
            {
                actResponse.Combine(await _voucherRepository.Value.RollbackVoucher(order.VoucherId ?? 0, order.CustomerId));
            }
            return actResponse;
        }

        public async Task<NumberOfOrders> GetNumberOrder()
        {
            var totalPending = await DbSet.Where(x => (x.OrderStatus == OrderStatusEnum.Pending.ToString() ||
                                                x.OrderStatus == OrderStatusEnum.WaitingForPayment.ToString() ||
                                                x.OrderStatus == OrderStatusEnum.Processing.ToString()) &&
                                                (x.CreatedDate >= DateTime.Now.Date && x.CreatedDate <= DateTime.Now.AddDays(1).Date))
                                .CountAsync();
            var totalCompleted = await DbSet.Where(x => x.OrderStatus == OrderStatusEnum.Completed.ToString() &&
                                    (x.CreatedDate >= DateTime.Now.Date && x.CreatedDate <= DateTime.Now.AddDays(1).Date))
                                .CountAsync();
            var totalCancelled = await DbSet.Where(x => x.OrderStatus == OrderStatusEnum.Cancelled.ToString() &&
                                    (x.CreatedDate >= DateTime.Now.Date && x.CreatedDate <= DateTime.Now.AddDays(1).Date))
                                .CountAsync();
            return new NumberOfOrders
            {
                TotalPending = totalPending,
                TotalCompleted = totalCompleted,
                TotalCancelled = totalCancelled,
                TotalOrder = totalPending + totalCompleted + totalCancelled
            };
        }

        public Task<bool> IsExisted(int orderId, int customerId)
        {
            return DbSet.Where(x => x.Id == orderId && x.CustomerId == customerId && x.IsDeleted != true).AnyAsync();
        }

        public Task<int> TotalOrderAsync()
        {
            return DbSet.CountAsync(x => x.IsDeleted != true);
        }

        public async Task<Dictionary<string, int>> GetOrderStatusSummaryAsync()
        {
            return await _context.Orders
                         .GroupBy(o => o.OrderStatus)
                         .Select(g => new { Status = g.Key, Count = g.Count() })
                         .ToDictionaryAsync(x => x.Status, x => x.Count);
        }
    }
}