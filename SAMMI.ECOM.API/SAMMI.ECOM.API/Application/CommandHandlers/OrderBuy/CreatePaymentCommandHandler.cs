using AutoMapper;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Services.VNPay;

namespace SAMMI.ECOM.API.Application.CommandHandlers.OrderBuy
{
    public class CreatePaymentCommandHandler : CustombaseCommandHandler<CreatePaymentCommand, PaymentDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IVNPayService _vnpayService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IPaymentMethodRepository _methodRepository;
        public CreatePaymentCommandHandler(
            IUsersRepository usersRepository,
            IVNPayService vnpayService,
            IHttpContextAccessor httpContextAccessor,
            IPaymentRepository paymentRepository,
            IPaymentMethodRepository paymentMethodRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _userRepository = usersRepository;
            _vnpayService = vnpayService;
            _httpContextAccessor = httpContextAccessor;
            _paymentRepository = paymentRepository;
            _methodRepository = paymentMethodRepository;
        }

        public override async Task<ActionResponse<PaymentDTO>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<PaymentDTO>();
            var paymentMethod = await _methodRepository.GetByIdAsync(request.PaymentMethodId);
            if (paymentMethod == null)
            {
                actResponse.AddError("Phương thức thanh toán không tồn tại");
                return actResponse;
            }

            request.CreatedDate = DateTime.Now;
            request.CreatedBy = "System";
            if (paymentMethod.Code == PaymentMethodEnum.VNPAY.ToString())
            {
                request.UserIdentity = (await _userRepository.FindById(_currentUser.Id)).IdentityGuid;
                var returnUrl = _vnpayService.CreatePaymentUrl(request, _httpContextAccessor.HttpContext);
                if (string.IsNullOrEmpty(returnUrl))
                {
                    actResponse.AddError("Không thể liên kết tới VNPay");
                    return actResponse;
                }

                var createPaymentRes = await _paymentRepository.CreateAndSave(request);
                actResponse.Combine(createPaymentRes);
                var paymentDTO = _mapper.Map<PaymentDTO>(createPaymentRes.Result);
                paymentDTO.ReturnUrl = returnUrl;
                actResponse.SetResult(paymentDTO);
            }
            else
            {
                var createPaymentRes = await _paymentRepository.CreateAndSave(request);
                actResponse.Combine(createPaymentRes);
                actResponse.SetResult(_mapper.Map<PaymentDTO>(createPaymentRes.Result));
            }

            return actResponse;
        }
    }
}
