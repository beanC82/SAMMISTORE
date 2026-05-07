using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;

namespace SAMMI.ECOM.API.Application.CommandHandlers.OrderBuy
{
    public class CUPaymentMethodCommandHandler : CustombaseCommandHandler<CUPaymentMethodCommand, PaymentMethodDTO>
    {
        private readonly IPaymentMethodRepository _methodRepository;

        public CUPaymentMethodCommandHandler(
            IPaymentMethodRepository methodRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _methodRepository = methodRepository;
        }

        public override async Task<ActionResponse<PaymentMethodDTO>> Handle(CUPaymentMethodCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<PaymentMethodDTO>();

            if (await _methodRepository.CheckExistName(request.Name, request.Id))
            {
                actResponse.AddError("Tên phương thức thanh toán đã tồn tại");
                return actResponse;
            }

            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                var createResponse = await _methodRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<PaymentMethodDTO>(createResponse.Result));
            }
            else
            {
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _methodRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<PaymentMethodDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CUPaymentMethodCommandValidator : AbstractValidator<CUPaymentMethodCommand>
    {
        public CUPaymentMethodCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên phương thức thanh toán không được bỏ trống");
        }
    }
}
