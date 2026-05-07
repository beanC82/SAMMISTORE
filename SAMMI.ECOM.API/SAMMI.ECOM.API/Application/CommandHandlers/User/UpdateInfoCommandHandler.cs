using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Utillity;
using SAMMI.ECOM.Domain.Commands.User;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Services.Auth;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.API.Application.CommandHandlers.User
{
    public class UpdateCustomerInfoCommandHandler : CustombaseCommandHandler<UpdateCustomerInfoRequest, CustomerDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> _authenticationService;
        private readonly EmailHelper _emailHelper;
        public UpdateCustomerInfoCommandHandler(
            IUsersRepository userRepository,
            IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> authenticationService,
            EmailHelper emailHelper,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _userRepository = userRepository;
            _authenticationService = authenticationService;
            _emailHelper = emailHelper;
        }

        public override async Task<ActionResponse<CustomerDTO>> Handle(UpdateCustomerInfoRequest request, CancellationToken cancellationToken)
        {
            var actionRes = new ActionResponse<CustomerDTO>();
            if (await _userRepository.IsExistEmail(request.Email, _currentUser.Id))
            {
                actionRes.AddError("Email này đã tồn tại.");
                return actionRes;
            }

            if (await _userRepository.IsExistPhone(request.Phone, _currentUser.Id))
            {
                actionRes.AddError("Số điện thoại này đã tồn tại.");
                return actionRes;
            }

            var user = await _userRepository.GetByIdAsync(_currentUser.Id);
            if (user == null)
            {
                actionRes.AddError("Người dùng không tồn tại.");
                return actionRes;
            }

            if (user.Email != request.Email)
            {
                user.VerifyToken = _authenticationService.CreateVerifyToken();
                user.IsVerify = false;
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.FullName = request.FirstName + " " + request.LastName;
            user.Phone = request.Phone;
            user.Email = request.Email;
            user.Birthday = request.Birthday;
            user.Gender = request.Gender;
            user.UpdatedDate = DateTime.Now;
            user.UpdatedBy = _currentUser.UserName;

            var updateRes = await _userRepository.UpdateAndSave(user);
            actionRes.Combine(updateRes);
            if (!actionRes.IsSuccess)
            {
                return actionRes;
            }

            if (user.IsVerify == false)
            {
                _emailHelper.SendEmailVerify(user.Email, user.FullName, user.VerifyToken);
            }

            actionRes.SetResult(_mapper.Map<CustomerDTO>(user));
            return actionRes;
        }

    }

    public class UpdateCustomerInfoCommandValidator : AbstractValidator<UpdateCustomerInfoRequest>
    {
        public UpdateCustomerInfoCommandValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty()
                .WithMessage("Họ không được bỏ trống");

            RuleFor(x => x.LastName)
                .NotEmpty()
                .WithMessage("Tên không được bỏ trống");

            RuleFor(x => x.Phone)
                .NotEmpty()
                .WithMessage("Điện thoại không được bỏ trống")
                .Length(10)
                .WithMessage("Điện thoại phải có đúng 10 chữ số")
                .Matches(@"^\d{10}$")
                .WithMessage("Điện thoại chỉ được chứa chữ số");

            RuleFor(x => x.Email)
                .Must(x => StringExtensions.IsValidEmail(x))
                .WithMessage("Email không đúng định dạng")
                .When(x => !string.IsNullOrEmpty(x.Email));

            //RuleFor(x => x.Birthday)
            //    .NotNull()
            //    .WithMessage("Ngày sinh không được bỏ trống");

            //RuleFor(x => x.IdCardNumber)
            //    .NotEmpty()
            //    .WithMessage("CCCD không được bỏ trống")
            //    .Length(12)
            //    .WithMessage("Số CCCD phải có đúng 12 chữ số")
            //    .Matches(@"^\d{12}$")
            //    .WithMessage("Số CCCD chỉ được chứa chữ số");
        }
    }

    public class UpdateEmployeeInfoCommandHandler : CustombaseCommandHandler<UpdateEmployeeInfoRequest, EmployeeDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> _authenticationService;
        private readonly EmailHelper _emailHelper;
        public UpdateEmployeeInfoCommandHandler(
            IUsersRepository userRepository,
            IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> authenticationService,
            EmailHelper emailHelper,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _userRepository = userRepository;
            _authenticationService = authenticationService;
            _emailHelper = emailHelper;
        }

        public override async Task<ActionResponse<EmployeeDTO>> Handle(UpdateEmployeeInfoRequest request, CancellationToken cancellationToken)
        {
            var actionRes = new ActionResponse<EmployeeDTO>();
            if (await _userRepository.IsExistEmail(request.Email, _currentUser.Id))
            {
                actionRes.AddError("Email này đã tồn tại.");
                return actionRes;
            }

            if (await _userRepository.IsExistPhone(request.Phone, _currentUser.Id))
            {
                actionRes.AddError("Số điện thoại này đã tồn tại.");
                return actionRes;
            }

            var user = await _userRepository.GetByIdAsync(_currentUser.Id);
            if (user == null)
            {
                actionRes.AddError("Người dùng không tồn tại.");
                return actionRes;
            }

            if (user.Email != request.Email)
            {
                user.VerifyToken = _authenticationService.CreateVerifyToken();
                user.IsVerify = false;
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.FullName = request.FirstName + " " + request.LastName;
            user.Phone = request.Phone;
            user.Email = request.Email;
            user.Birthday = request.Birthday;
            user.IdCardNumber = request.IdCardNumber;
            user.Gender = request.Gender;
            user.UpdatedDate = DateTime.Now;
            user.UpdatedBy = _currentUser.UserName;

            var updateRes = await _userRepository.UpdateAndSave(user);
            actionRes.Combine(updateRes);
            if (!actionRes.IsSuccess)
            {
                return actionRes;
            }

            if (user.IsVerify == false)
            {
                _emailHelper.SendEmailVerify(user.Email, user.FullName, user.VerifyToken);
            }

            actionRes.SetResult(_mapper.Map<EmployeeDTO>(user));
            return actionRes;
        }

    }

    public class UpdateEmployeeInfoCommandValidator : AbstractValidator<UpdateEmployeeInfoRequest>
    {
        public UpdateEmployeeInfoCommandValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty()
                .WithMessage("Họ không được bỏ trống");

            RuleFor(x => x.LastName)
                .NotEmpty()
                .WithMessage("Tên không được bỏ trống");

            RuleFor(x => x.Phone)
                .NotEmpty()
                .WithMessage("Điện thoại không được bỏ trống")
                .Length(10)
                .WithMessage("Điện thoại phải có đúng 10 chữ số")
                .Matches(@"^\d{10}$")
                .WithMessage("Điện thoại chỉ được chứa chữ số");

            RuleFor(x => x.Email)
                .Must(x => StringExtensions.IsValidEmail(x))
                .WithMessage("Email không đúng định dạng")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.Birthday)
                .NotNull()
                .WithMessage("Ngày sinh không được bỏ trống");

            RuleFor(x => x.IdCardNumber)
                .NotEmpty()
                .WithMessage("CCCD không được bỏ trống")
                .Length(12)
                .WithMessage("Số CCCD phải có đúng 12 chữ số")
                .Matches(@"^\d{12}$")
                .WithMessage("Số CCCD chỉ được chứa chữ số");
        }
    }
}
