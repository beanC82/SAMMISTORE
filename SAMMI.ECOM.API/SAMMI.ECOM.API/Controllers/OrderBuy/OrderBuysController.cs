using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.API.Services.SeriaLog;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.VNPay;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.System;
using SAMMI.ECOM.Infrastructure.Services.VNPay;

namespace SAMMI.ECOM.API.Controllers.OrderBuy
{
    [Route("api/order-buy")]
    [ApiController]
    public class OrderBuysController : CustomBaseController
    {
        private readonly IVNPayService _vnpayService;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IPaymentMethodRepository _paymentMethodRepository;
        private readonly IVNPayService _vnpService;
        private readonly IMapper _mapper;
        private readonly IUsersRepository _userRepository;
        private readonly IConfiguration _config;
        private readonly IOrderQueries _orderQueries;
        private readonly INotificationRepository _notifiRepository;
        public OrderBuysController(IMediator mediator,
            IVNPayService vNPayService,
            IPaymentRepository paymentRepository,
            IOrderRepository orderRepository,
            IPaymentMethodRepository paymentMethodRepository,
            IVNPayService vnpService,
            UserIdentity currentUser,
            IUsersRepository usersRepository,
            IConfiguration config,
            IOrderQueries orderQueries,
            INotificationRepository notificationRepository,
            IMapper mapper,
            ILogger<OrderBuysController> logger) : base(mediator, logger)
        {
            _vnpayService = vNPayService;
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
            _paymentMethodRepository = paymentMethodRepository;
            _vnpayService = vnpService;
            _mapper = mapper;
            UserIdentity = currentUser;
            _userRepository = usersRepository;
            _config = config;
            _orderQueries = orderQueries;
            _notifiRepository = notificationRepository;
        }

        [AuthorizePermission(PermissionEnum.OrderView)]
        [HttpGet]
        public async Task<IActionResult> GetOrdersAsync([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.Grid)
            {
                return Ok(await _orderQueries.GetList(request));
            }
            return Ok();
        }

        [AuthorizePermission(PermissionEnum.OrderView)]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderAsync(int id)
        {
            if (!_orderRepository.IsExisted(id))
            {
                return BadRequest("Mã đơn hàng không tồn tại");
            }
            return Ok(await _orderQueries.GetById(id));
        }

        [AuthorizePermission(PermissionEnum.OrderUpdateStatus)]
        [HttpPost("update-status-order")]
        public async Task<IActionResult> UpdateOrderStatusAsync([FromBody] UpdateOrderStatusCommand request)
        {
            if (!_orderRepository.IsExisted(request.OrderId))
            {
                return BadRequest("Mã đơn hàng không tồn tại.");
            }

            var updateStatus = await _orderRepository.UpdateOrderStatus(request);
            if (updateStatus.IsSuccess)
            {
                return Ok(updateStatus);
            }
            return BadRequest(updateStatus);
        }

        [AuthorizePermission(PermissionEnum.CustomerOrderTrack)]
        [HttpGet("customer/get-my-orders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.Grid)
            {
                return Ok(await _orderQueries.GetListOrdersByCustomerId(UserIdentity.Id, request));
            }
            return Ok(await _orderQueries.GetOrdersByCustomerId(UserIdentity.Id, request));
        }

        [AuthorizePermission(PermissionEnum.CustomerOrderTrack)]
        [HttpGet("customer/{code}")]
        public async Task<IActionResult> GetOrderAsync(string code)
        {
            var order = await _orderRepository.GetByCode(code: code);
            if (order == null)
            {
                return BadRequest("Mã đơn hàng không tồn tại");
            }
            if (order.CustomerId != UserIdentity.Id)
            {
                return BadRequest("Bạn không có quyền cho đơn hàng này.");
            }

            return Ok(await _orderQueries.GetById(order.Id));
        }

        [AuthorizePermission(PermissionEnum.CustomerOrderCancel)]
        [HttpPost("customer/update-status-order/{code}")]
        public async Task<IActionResult> UpdateStatusOrderCustomerAsync(string code, [FromBody] OrderStatusEnum status = OrderStatusEnum.Cancelled)
        {
            if (status != OrderStatusEnum.Cancelled)
            {
                return BadRequest("Trạng thái đơn hàng không hợp lệ");
            }
            var order = await _orderRepository.FindByCode(code);
            if (order == null)
            {
                return BadRequest("Mã đơn hàng không tồn tại");
            }
            if (order != null && order.CustomerId != UserIdentity.Id)
            {
                return BadRequest("Bạn không có quyền cho đơn hàng này.");
            }
            var updateOrderRes = await _orderRepository.UpdateOrderStatus(order.Id, status, TypeUserEnum.Customer);
            if (updateOrderRes.IsSuccess)
            {
                return Ok(updateOrderRes);
            }
            return BadRequest(updateOrderRes);
        }


        [AuthorizePermission(PermissionEnum.OrderUpdateStatus)]
        [HttpPost]
        public async Task<IActionResult> CancelledOrderAsync([FromBody] int orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (!_orderRepository.IsExisted(orderId))
            {
                return BadRequest("Mã đơn hàng không tồn tại.");
            }

            var updateRes = await _orderRepository.CancelldOrder(orderId);
            if (updateRes.IsSuccess)
                return Ok(updateRes);
            return BadRequest(updateRes);
        }

        [AuthorizePermission(PermissionEnum.CustomerOrderPlace)]
        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand request)
        {
            if (request.Id != 0)
                return BadRequest();

            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            AppLogger.LogWarning(UserIdentity,
                    PermissionEnum.CustomerOrderPlace.ToPolicyName(),
                    $"User {UserIdentity.FullName} tạo đơn hàng thất bại!",
                    new
                    {
                        response.Errors
                    });
            return BadRequest(response);
        }


        [HttpPost("create-order-shop")]
        public async Task<IActionResult> CreateOrderFromShop([FromBody] CreateOrderFromShopCommand request)
        {
            if (request.Id != 0)
                return BadRequest();

            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            AppLogger.LogWarning(UserIdentity,
                    PermissionEnum.CustomerOrderPlace.ToPolicyName(),
                    $"User {UserIdentity.FullName} tạo đơn hàng thất bại!",
                    new
                    {
                        response.Errors
                    });
            return BadRequest(response);
        }

        [AllowAnonymous]
        [HttpGet("vnpay/payment-callback")]
        public async Task<IActionResult> PaymentCallback()
        {
            var paymentResponse = _vnpayService.PaymentExecute(Request.Query);

            if (!paymentResponse.IsSuccess)
            {
                return BadRequest(paymentResponse);
            }

            var paymentResult = paymentResponse.Result;
            string[] paymentInfos = paymentResult.OrderDescription.Split('#')[1].Split('_');
            string orderCode = paymentInfos[0];
            //var redirectUrl = paymentResult.PlatForm == "App" ? _config.GetValue<string>("VNPAYOptions:RedirectUrlApp") : _config.GetValue<string>("VNPAYOptions:RedirectUrl");
            var order = await _orderRepository.FindByCode(orderCode);
            var redirectUrl = order.WardId != null ? _config.GetValue<string>("VNPAYOptions:RedirectUrl") : _config.GetValue<string>("VNPAYOptions:RedirectUrlBill");
            var payment = await _paymentRepository.GetByOrderCode(orderCode);
            if (payment == null)
            {
                AppLogger.LogWarning(UserIdentity,
                    "PAYMENT_VNPAY",
                    $"Đơn hàng không tồn tại!",
                    new
                    {
                        orderCode
                    });
                return Redirect($"{redirectUrl}?payment-status=0&error-message={Uri.EscapeUriString("Giao dịch không tồn tại")}");
            }
            if (paymentResult.VnPayResponseCode != "00")
            {
                AppLogger.LogWarning(UserIdentity,
                    "PAYMENT_VNPAY",
                    $"Giao dịch thất bại!",
                    new
                    {
                        orderCode
                    });
                _paymentRepository.UpdateStatus(payment.Id, PaymentStatusEnum.Unpaid);
                return Redirect($"{redirectUrl}?payment-status=0&error-message={Uri.EscapeUriString("Giao dịch không thành công.")}");
            }

            // update info payment
            payment.TransactionId = paymentResult.TransactionId;
            payment.PaymentStatus = PaymentStatusEnum.Paid.ToString();
            payment.PaymentDate = paymentResult.PaymentDate;
            var paymentUpdateRes = await _paymentRepository.UpdateAndSave(payment);
            if (!paymentUpdateRes.IsSuccess)
            {
                AppLogger.LogWarning(UserIdentity,
                    "PAYMENT_VNPAY",
                    $"Lỗi cập nhật trạng thái thanh toán.",
                    new
                    {
                        orderCode
                    });
                return Redirect($"{redirectUrl}?payment-status=0&error-message={Uri.EscapeUriString("Lỗi cập nhật trạng thái thanh toán.")}");
            }

            UpdateOrderStatusCommand updateOrderStatusCommand = null;
            if (order.WardId == null)
            {
                updateOrderStatusCommand = new UpdateOrderStatusCommand
                {
                    OrderId = payment.OrderId,
                    PaymentStatus = PaymentStatusEnum.Paid,
                    ShippingStatus = ShippingStatusEnum.NotShipped,
                };
            }
            else
            {
                updateOrderStatusCommand = new UpdateOrderStatusCommand
                {
                    OrderId = payment.OrderId,
                    PaymentStatus = PaymentStatusEnum.Paid,
                    ShippingStatus = ShippingStatusEnum.Processing,
                };
            }
            var orderUpdateRes = await _orderRepository.UpdateOrderStatus(updateOrderStatusCommand);
            if (!orderUpdateRes.IsSuccess)
            {
                AppLogger.LogError(UserIdentity,
                    "PAYMENT_VNPAY",
                    orderUpdateRes.Errors.ToString(),
                    new Exception(),
                    new
                    {
                        orderCode
                    });
                return Redirect($"{redirectUrl}?payment-status=0&error-message={Uri.EscapeUriString(orderUpdateRes.Message)}");
            }

            AppLogger.LogAction(UserIdentity,
                    "PAYMENT_VNPAY",
                    $"User {UserIdentity.FullName} thanh toán đơn hàng thành công!",
                    new
                    {
                        orderCode,
                        updateOrderStatusCommand.PaymentStatus,
                        updateOrderStatusCommand.ShippingStatus,
                    });

            //_notifiRepository.CreateNotifiForRole(RoleTypeEnum.ADMIN.ToString(),
            //    new Domain.AggregateModels.OrderBuy.Notification()
            //    {
            //        Title = "Khách hàng đã thanh toán, chờ xử lý",
            //        Content = $"Có đơn hàng mới mã {orderCode} đã thanh toán, đang chờ xử lý"
            //    });

            //_notifiRepository.CreateNotifiForRole(RoleTypeEnum.MANAGER.ToString(),
            //    new Domain.AggregateModels.OrderBuy.Notification()
            //    {
            //        Title = "Khách hàng đã thanh toán, chờ xử lý",
            //        Content = $"Có đơn hàng mới mã {orderCode} đã thanh toán, đang chờ xử lý"
            //    });
            return Redirect($"{redirectUrl}?order-id={order.Id}&payment-status=1");
        }

        [AuthorizePermission(PermissionEnum.CustomerOrderPayment)]
        [HttpPost("pay-back")]
        public async Task<IActionResult> Payback([FromBody] CreatePayback model)
        {
            var actRes = new ActionResponse<PaymentDTO>();
            var order = await _orderRepository.GetByCode(code: model.OrderCode);
            if (order == null)
            {
                actRes.AddError($"Đơn hàng có mã {model.OrderCode} không tồn tại");
                return BadRequest(actRes);
            }
            var payment = await _paymentRepository.GetByOrderCode(model.OrderCode);
            if (payment == null || payment.PaymentStatus == PaymentStatusEnum.Failed.ToString())
            {
                var paymentRequest = new CreatePaymentCommand
                {
                    OrderId = order.Id,
                    OrderCode = order.Code,
                    PaymentAmount = await _orderRepository.CalculateTotalPrice(order.Id),
                    PaymentStatus = PaymentStatusEnum.Pending.ToString(),
                    PaymentMethodId = (await _paymentMethodRepository.GetByCode(PaymentMethodEnum.VNPAY.ToString())).Id,
                    PlatForm = model.PlatForm
                };
                var createPaymentRes = await _mediator.Send(paymentRequest);
                if (!createPaymentRes.IsSuccess)
                {
                    AppLogger.LogWarning(UserIdentity,
                        "PAYBACK_VNPAY",
                        createPaymentRes.Errors.ToString(),
                        new
                        {
                            order.Code
                        });
                    actRes.AddError(createPaymentRes.Message);
                    return BadRequest(actRes);
                }

                AppLogger.LogAction(UserIdentity,
                    "PAYBACK_VNPAY",
                    $"User {UserIdentity.FullName} thanh toán lại đơn hàng thành công!",
                    new
                    {
                        order.Code
                    });
                return Ok(createPaymentRes);
            }
            else
            {
                var paymentMethod = await _paymentMethodRepository.GetByIdAsync(payment.PaymentMethodId);
                if (paymentMethod.Code != PaymentMethodEnum.VNPAY.ToString())
                {
                    actRes.AddError("Không thể thanh toán! Chỉ áp dụng cho thanh toán VNPay");
                    return BadRequest(actRes);
                }
                if (payment.PaymentStatus == PaymentStatusEnum.Paid.ToString())
                {
                    actRes.AddError("Đơn hàng đã được thanh toán");
                    return BadRequest(actRes);
                }
                var paymentCreate = _mapper.Map<CreatePaymentCommand>(payment);
                paymentCreate.OrderCode = order.Code;
                paymentCreate.UserIdentity = (await _userRepository.FindById(UserIdentity.Id)).IdentityGuid;
                paymentCreate.PlatForm = model.PlatForm;
                var paymentUrl = _vnpayService.CreatePaymentUrl(paymentCreate, HttpContext);
                if (string.IsNullOrEmpty(paymentUrl))
                {
                    AppLogger.LogWarning(UserIdentity,
                        "PAYBACK_VNPAY",
                        "Lỗi liên kết tới VNPay",
                        new
                        {
                            order.Code
                        });
                    actRes.AddError("Không thể liên kết tới VNPay");
                    return BadRequest(actRes);
                }

                var paymentDTO = _mapper.Map<PaymentDTO>(payment);
                paymentDTO.ReturnUrl = paymentUrl;

                AppLogger.LogAction(UserIdentity,
                    "PAYBACK_VNPAY",
                    $"User {UserIdentity.FullName} thanh toán lại đơn hàng thành công!",
                    new
                    {
                        order.Code
                    });
                actRes.SetResult(paymentDTO);
                return Ok(actRes);
            }
        }

        [AllowAnonymous]
        [HttpGet("vnpay/ipn")]
        public async Task<IActionResult> VNPayIPN([FromForm] VNPayIPNDTO model)
        {
            if (!_vnpayService.ValidateChecksum(model.vnp_SecureHash))
            {
                return BadRequest("Invalid checksum");
            }

            string[] paymentInfos = model.vnp_OrderInfo.Split('#')[1].Split('_');
            string orderCode = paymentInfos[0];
            var payment = await _paymentRepository.GetByOrderCode(orderCode);
            if (model.vnp_ResponseCode == "00") // 00 là mã thành công
            {
                payment.PaymentStatus = PaymentStatusEnum.Paid.ToString();
                payment.TransactionId = model.vnp_TransactionNo;
                payment.PaymentDate = DateTime.Parse(model.vnp_PayDate);
                await _paymentRepository.UpdateAndSave(payment);

                var updateOrderStatusCommand = new UpdateOrderStatusCommand
                {
                    OrderId = payment.OrderId,
                    PaymentStatus = PaymentStatusEnum.Paid,
                    ShippingStatus = ShippingStatusEnum.Processing,
                };
                var orderUpdateRes = await _orderRepository.UpdateOrderStatus(updateOrderStatusCommand);
                if (!orderUpdateRes.IsSuccess)
                {
                    return BadRequest();
                }
            }
            else
            {
                await _paymentRepository.UpdateStatus(payment.Id, PaymentStatusEnum.Failed);
            }

            return Ok();
        }
    }
}
