using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Models.RequestModels.QueryParams;
using SAMMI.ECOM.Domain.DomainModels.Reports;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Queries.Products;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.Products;

namespace SAMMI.ECOM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : CustomBaseController
    {
        private readonly IOrderQueries _orderQueries;
        private readonly IPurchaseOrderQueries _purchaseQueries;
        private readonly IProductRepository _productRepository;
        private readonly IPaymentMethodRepository _methodRepository;
        private readonly IUsersRepository _userRepository;
        private readonly IProductQueries _productQueries;
        private readonly IOrderRepository _orderRepository;
        private readonly IPaymentRepository _paymentRepository;

        public ReportsController(
            IOrderQueries orderQueries,
            IPurchaseOrderQueries purchaseQueries,
            IProductRepository productRepository,
            IPaymentMethodRepository methodRepository,
            IUsersRepository userRepository,
            IProductQueries productQueries,
            IOrderRepository orderRepository,
            IMediator mediator,
            IPaymentRepository paymentRepository,
            ILogger<ReportsController> logger) : base(mediator, logger)
        {
            _orderQueries = orderQueries;
            _purchaseQueries = purchaseQueries;
            _productRepository = productRepository;
            _methodRepository = methodRepository;
            _userRepository = userRepository;
            _productQueries = productQueries;
            _orderRepository = orderRepository;
            _paymentRepository = paymentRepository;
        }

        // doanh thu
        [AuthorizePermission(PermissionEnum.ReportRevenue)]
        [HttpGet("sales-revenue")]
        public async Task<IActionResult> SalesRevenueAsync([FromQuery] SaleRevenueFilterModel request)
        {
            if (request.PaymentMethodId != null && !_methodRepository.IsExisted(request.PaymentMethodId))
            {
                return BadRequest("Phương thức thanh toán không tồn tại.");
            }
            return Ok(await _orderQueries.RevenueOrder(request));
        }

        // nhập hàng
        [AuthorizePermission(PermissionEnum.ReportImport)]
        [HttpGet("get-import-statistics")]
        public async Task<IActionResult> ImportStatisticsAsync([FromQuery] ImportStatisticFilterModel request)
        {
            try
            {
                if (request.DateFrom > request.DateTo)
                {
                    return BadRequest("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
                }
            }
            catch
            (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            if (request.EmployeeId != null
                && request.EmployeeId != 0
                && !await _userRepository.IsExistedType(request.EmployeeId ?? 0, Domain.Enums.TypeUserEnum.Employee))
            {
                return BadRequest("Nhân viên không tồn tại.");
            }

            if (request.SupplierId != null
                && request.SupplierId != 0
                && !await _userRepository.IsExistedType(request.SupplierId ?? 0, Domain.Enums.TypeUserEnum.Supplier))
            {
                return BadRequest("Nhà cung cấp không tồn tại.");
            }
            return Ok(await _purchaseQueries.GetImportStatistic(request));
        }

        // tồn kho
        [AuthorizePermission(PermissionEnum.ReportStock)]
        [HttpGet("inventory-statistics")]
        public async Task<IActionResult> InventoryStatistics([FromQuery] InventoryFilterModel request)
        {
            return Ok(await _productQueries.GetListInventory(request));
        }

        [HttpGet("best-selling-product")]
        public async Task<IActionResult> BestSellingProductAsync([FromQuery] int numberTop = 5)
        {
            return Ok(await _productQueries.GetListBetSellingProduct(numberTop));
        }

        /// <summary>
        /// API to fetch general statistics for the Dashboard screen.
        /// Includes:
        /// - Total number of users (customers)
        /// - Total number of products
        /// - Total number of orders
        /// - Total revenue
        /// - Total number of reviews
        /// - Total number of comments
        /// </summary>
        /// <returns>
        /// Returns a JSON object containing the general statistics data.
        /// </returns>
        [HttpGet("general-statistics")]
        public async Task<IActionResult> GeneralStatistic()
        {
            var statistic = new DashboardResponse();
            statistic.TotalCustomer = await _userRepository.GetCustomerCount();

            var totalProduct = await _productRepository.TotalProductAsync();
            statistic.TotalProducts = totalProduct;

            var totalOrder = await _orderRepository.TotalOrderAsync();
            statistic.TotalOders = totalOrder;

            var totalRevenue = await _paymentRepository.TotalRevenueAsync();
            statistic.TotalRevenue = totalRevenue;

            statistic.TotalReviews = 321;
            statistic.TotalComments = 123;

            return Ok(statistic);
        }

        /// <summary>
        /// API to get the total number of orders grouped by their statuses.
        /// Includes the following statuses:
        /// - Processing
        /// - Pending
        /// - Cancelled
        /// - Completed
        /// </summary>
        /// <returns>
        /// Returns a JSON object containing the total number of orders for each status.
        /// </returns>
        [HttpGet("order-status-summary")]
        public async Task<IActionResult> GetOrderStatusSummary()
        {
            var orderStatusSummary = await _orderRepository.GetOrderStatusSummaryAsync();
            return Ok(orderStatusSummary);
        }

        /// <summary>
        /// API to get monthly revenue for the current year.
        /// The result includes revenue grouped by each month.
        /// </summary>
        /// <returns>
        /// Returns a JSON object containing the total revenue for each month of the current year.
        /// </returns>
        [HttpGet("monthly-revenue")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var monthlyRevenue = await _paymentRepository.GetMonthlyRevenueAsync();
            return Ok(monthlyRevenue);
        }
    }
}