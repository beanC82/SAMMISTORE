using AutoMapper;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Auth;
using SAMMI.ECOM.Domain.Commands.User;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries;
using SAMMI.ECOM.Infrastructure.Services.Auth;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.API.Application.CommandHandlers.Auths
{
    public class RegisterCommandHandler : CustombaseCommandHandler<RegisterCommand, RegisterResult>
    {
        private readonly IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> _authService;
        private readonly IMediator _mediator;
        private readonly IUsersQueries _userQueries;
        public RegisterCommandHandler(
            IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> authService,
            IMediator mediator,
            IConfiguration config,
            IUsersQueries userQueries,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _authService = authService;
            _mediator = mediator;
            _userQueries = userQueries;
        }

        public override async Task<ActionResponse<RegisterResult>> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<RegisterResult>();

            var checkValidatePassword = await _authService.ValidatePassword(request.Password);
            if (!checkValidatePassword.Succeeded)
            {
                foreach (var err in checkValidatePassword.Errors)
                {
                    actResponse.AddError(err.Description, err.Code);
                }
                return actResponse;
            }

            var customer = _mapper.Map<CUCustomerCommand>(request);
            customer.Code = await _userQueries.GetCodeByLastId(CodeEnum.Customer);
            customer.IsActive = true;
            var createResponse = await _mediator.Send(customer, cancellationToken);
            actResponse.Combine(createResponse);
            if (!createResponse.IsSuccess)
            {
                return actResponse;
            }

            return actResponse;
        }
    }

    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty()
                .WithMessage("Họ không được bỏ trống.");

            RuleFor(x => x.LastName)
                .NotEmpty()
                .WithMessage("Tên không được bỏ trống.");

            RuleFor(x => x.Phone)
                .NotEmpty()
                .WithMessage("Điện thoại không được bỏ trống")
                .Length(10)
                .WithMessage("Điện thoại phải có đúng 10 chữ số")
                .Matches(@"^\d{10}$")
                .WithMessage("Điện thoại chỉ được chứa chữ số");

            RuleFor(x => x.Email)
                .NotEmpty()
                .Must(x => StringExtensions.IsValidEmail(x))
                .WithMessage("Email không đúng định dạng");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Mật khẩu không được bỏ trống.");

            RuleFor(x => x.RePassword)
                .NotEmpty()
                .WithMessage("Xác nhận mật khẩu không được bỏ trống.")
                .Equal(x => x.Password)
                .WithMessage("Xác nhận mật khẩu không khớp với mật khẩu");
        }
    }
}
