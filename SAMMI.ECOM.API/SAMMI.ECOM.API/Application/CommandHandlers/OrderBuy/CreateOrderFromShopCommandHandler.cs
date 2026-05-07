using AutoMapper;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.API.Services.SeriaLog;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Infrastructure.Repositories.System;

namespace SAMMI.ECOM.API.Application.CommandHandlers.OrderBuy
{
    public class CreateOrderFromShopCommandHandler : CustombaseCommandHandler<CreateOrderFromShopCommand, OrderDTO>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderDetailRepository _detailRepository;
        private readonly IVoucherRepository _voucherRepository;
        private readonly IWardRepository _wardRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ICartDetailRepository _cartDetailRepository;
        private readonly IProductRepository _productRepository;
        private readonly IMediator _mediator;
        private readonly IPaymentMethodRepository _methodRepository;
        private readonly IShippingCompanyRepository _shippingRepository;
        private readonly ICartDetailQueries _cartDetailQueries;
        private readonly IMyVoucherRepository _myVoucherRepository;
        private readonly INotificationRepository _notifiRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly UserIdentity _userIdentity;
        public CreateOrderFromShopCommandHandler(
            IOrderRepository orderRepository,
            IOrderDetailRepository detailRepository,
            IVoucherRepository voucherRepository,
            IWardRepository wardRepository,
            ICartRepository cartRepository,
            ICartDetailRepository cartDetailRepository,
            IProductRepository productRepository,
            IMediator mediator,
            IPaymentMethodRepository methodRepository,
            IShippingCompanyRepository shippingCompanyRepository,
            ICartDetailQueries cartDetailQueries,
            IMyVoucherRepository myVoucherRepository,
            UserIdentity currentUser,
            IRoleRepository roleRepository,
            UserIdentity userIdentity,
            INotificationRepository notificationRepository,
            IMapper mapper) : base(currentUser, mapper)
        {
            _orderRepository = orderRepository;
            _detailRepository = detailRepository;
            _voucherRepository = voucherRepository;
            _wardRepository = wardRepository;
            _cartRepository = cartRepository;
            _cartDetailRepository = cartDetailRepository;
            _productRepository = productRepository;
            _mediator = mediator;
            _methodRepository = methodRepository;
            _shippingRepository = shippingCompanyRepository;
            _cartDetailQueries = cartDetailQueries;
            _myVoucherRepository = myVoucherRepository;
            _notifiRepository = notificationRepository;
            _roleRepository = roleRepository;
        }

        public override async Task<ActionResponse<OrderDTO>> Handle(CreateOrderFromShopCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<OrderDTO>();

            foreach (var p in request.Details)
            {
                if (!_productRepository.IsExisted(p.ProductId))
                {
                    actResponse.AddError("Mã sản phẩm không tồn tại.");
                    return actResponse;
                }
            }

            var paymentMethod = await _methodRepository.GetByIdAsync(request.PaymentMethodId);
            if (paymentMethod == null)
            {
                actResponse.AddError("Mã phương thức thanh toán không tồn tại");
                return actResponse;
            }

            decimal totalAmount = 0;
            foreach (var item in request.Details)
            {
                item.Price = await _productRepository.GetPrice(item.ProductId);
                totalAmount += item.Price * item.Quantity;
            }

            // create order from ship & cal shipcost
            request.VoucherId = request.VoucherId == 0 ? null : request.VoucherId;
            if (request.VoucherId != null)
            {
                var validVoucherResponse = await _voucherRepository.ValidVoucher(request.VoucherId ?? 0, _currentUser.Id, 3, totalAmount, request.Details);
                if (!validVoucherResponse.IsSuccess)
                {
                    actResponse.AddError(validVoucherResponse.Message);
                    return actResponse;
                }
            }


            // create order
            request.CustomerId = _currentUser.Id;
            request.Code = Guid.NewGuid().ToString();
            request.ShippingStatus = ShippingStatusEnum.NotShipped.ToString();
            request.OrderStatus = paymentMethod.Code == PaymentMethodEnum.VNPAY.ToString()
                ? OrderStatusEnum.WaitingForPayment.ToString()
                : paymentMethod.Code == PaymentMethodEnum.CASH.ToString()
                ? OrderStatusEnum.Completed.ToString()
                : OrderStatusEnum.Pending.ToString();
            request.CreatedDate = DateTime.Now;
            request.CreatedBy = _userIdentity.UserName;

            var createOrderRes = await _orderRepository.CreateAndSave(request);
            actResponse.Combine(createOrderRes);
            if (!actResponse.IsSuccess)
            {
                return actResponse;
            }
            var orderCreated = createOrderRes.Result;

            //create order detai
            foreach (var detail in request.Details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (detail.Quantity > product.StockQuantity)
                {
                    actResponse.AddError("Số lượng hàng trong kho không đủ! Vui lòng đặt lại đơn hàng");
                    return actResponse;
                }
                detail.OrderId = orderCreated.Id;
                detail.CreatedDate = DateTime.Now;
                detail.CreatedBy = "System";
                var createDetailRes = await _detailRepository.CreateAndSave(_mapper.Map<OrderDetail>(detail));
                actResponse.Combine(createDetailRes);
                if (!actResponse.IsSuccess)
                    return actResponse;

                product.StockQuantity -= detail.Quantity;
                actResponse.Combine(await _productRepository.UpdateAndSave(product));
                if (!actResponse.IsSuccess)
                {
                    return actResponse;
                }
            }

            // calculate discount
            if (request.VoucherId != 0 && request.VoucherId != null)
            {
                var totalDiscount = await _voucherRepository.CalculateDiscount(request.VoucherId ?? 0, 0, totalAmount);
                request.DiscountValue = totalDiscount;
                totalAmount -= totalDiscount;
                // update kho voucher
                var myVoucher = await _myVoucherRepository.GetDataByVoucherAndCustomer(request.VoucherId ?? 0, _currentUser.Id);
                if (myVoucher != null)
                {
                    myVoucher.IsUsed = true;
                    myVoucher.UpdatedDate = DateTime.Now;
                    myVoucher.UpdatedBy = "System";

                    actResponse.Combine(await _myVoucherRepository.UpdateAndSave(myVoucher));
                    if (!actResponse.IsSuccess)
                        return actResponse;
                }
                // update voucher
                var voucher = await _voucherRepository.GetByIdAsync(request.VoucherId);
                voucher.UsedCount++;
                actResponse.Combine(await _voucherRepository.UpdateAndSave(voucher));
            }

            //create payment
            var paymentRequest = new CreatePaymentCommand
            {
                OrderId = orderCreated.Id,
                OrderCode = orderCreated.Code,
                PaymentAmount = totalAmount,
                PaymentStatus = paymentMethod.Code == PaymentMethodEnum.VNPAY.ToString()
                    ? PaymentStatusEnum.Pending.ToString()
                    : paymentMethod.Code == PaymentMethodEnum.CASH.ToString()
                    ? PaymentStatusEnum.Paid.ToString()
                    : PaymentStatusEnum.Unpaid.ToString(),
                PaymentMethodId = request.PaymentMethodId,
            };

            var paymentReponse = await _mediator.Send(paymentRequest);
            actResponse.Combine(paymentReponse);
            if (!actResponse.IsSuccess)
            {
                return actResponse;
            }
            var orderResult = _mapper.Map<OrderDTO>(orderCreated);
            if (paymentMethod.Code == PaymentMethodEnum.VNPAY.ToString())
                orderResult.ReturnUrl = paymentReponse.Result.ReturnUrl;

            AppLogger.LogAction(_currentUser,
                    PermissionEnum.CustomerOrderPlace.ToPolicyName(),
                    $"User {_currentUser.FullName} tạo đơn hàng #{orderResult.Code} thành công!",
                    new
                    {
                        orderResult.Code,
                        totalAmount,
                        PaymentMethod = paymentMethod.Code.ToString()
                    });

            //await _notifiRepository.CreateNotifiForRole(RoleTypeEnum.ADMIN.ToString(),
            //    new Domain.AggregateModels.OrderBuy.Notification()
            //    {
            //        Title = "Có đơn hàng mới, đang chờ thanh toán",
            //        Content = $"Có đơn hàng mới mã {orderCreated.Code}, đang chờ thanh toán",
            //        CreatedBy = _currentUser.UserName
            //    });

            //await _notifiRepository.CreateNotifiForRole(RoleTypeEnum.MANAGER.ToString(),
            //    new Domain.AggregateModels.OrderBuy.Notification()
            //    {
            //        Title = "Có đơn hàng mới, đang chờ thanh toán",
            //        Content = $"Có đơn hàng mới mã {orderCreated.Code}, đang chờ thanh toán",
            //        CreatedBy = _currentUser.UserName
            //    });


            actResponse.SetResult(orderResult);

            return actResponse;
        }
    }

    public class CreateOrderFromShopCommandValidator : AbstractValidator<CreateOrderFromShopCommand>
    {
        public CreateOrderFromShopCommandValidator()
        {
            RuleFor(x => x.PaymentMethodId)
                .NotEmpty()
                .WithMessage("Phương thức thanh toán không được bỏ trống");

            RuleForEach(x => x.Details)
                .NotNull()
                .WithMessage("Đơn hàng phải mua ít nhất 1 sản phẩm")
                .SetValidator(new OrderDetailCommandValidator());
        }
    }
}
