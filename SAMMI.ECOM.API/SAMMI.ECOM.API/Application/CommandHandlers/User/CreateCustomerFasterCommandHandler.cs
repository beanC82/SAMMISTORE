using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Utillity;
using SAMMI.ECOM.Domain.Commands.User;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;
using SAMMI.ECOM.Infrastructure.Services.Auth;
using SAMMI.ECOM.Infrastructure.Services.Auth.Helpers;
using SAMMI.ECOM.Utility;
using System.Security.Cryptography;

namespace SAMMI.ECOM.API.Application.CommandHandlers.User
{
    public class CreateCustomerFasterCommandHandler : CustombaseCommandHandler<CreateCustomerFasterCommand, CustomerDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> _authService;
        private readonly IWardRepository _wardRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly ICustomerAddressRepository _addressRepository;
        private readonly IConfiguration _config;
        private readonly EmailHelper emailHelper;
        private readonly IUsersQueries _usersQueries;

        private static readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();

        public CreateCustomerFasterCommandHandler(
            IUsersRepository userRepository,
            IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> authService,
            IWardRepository wardRepository,
            IRoleRepository roleRepository,
            ICustomerAddressRepository addressRepository,
            IConfiguration config,
            IUsersQueries usersQueries,
            UserIdentity currentUser, IMapper mapper) : base(currentUser, mapper)
        {
            _authService = authService;
            _userRepository = userRepository;
            _wardRepository = wardRepository;
            _roleRepository = roleRepository;
            _addressRepository = addressRepository;
            _config = config;
            emailHelper = new EmailHelper(config);
            _usersQueries = usersQueries;
        }

        public override async Task<ActionResponse<CustomerDTO>> Handle(CreateCustomerFasterCommand request, CancellationToken cancellationToken)
        {
            var actionResponse = new ActionResponse<CustomerDTO>();
            #region validate
            if (!string.IsNullOrEmpty(request.Email) && await _userRepository.IsExistEmail(request.Email, request.Id, TypeUserEnum.Customer))
            {
                actionResponse.AddError("Email đã tồn tại");
                return actionResponse;
            }

            if (!string.IsNullOrEmpty(request.Phone) && await _userRepository.IsExistPhone(request.Phone, request.Id, TypeUserEnum.Customer))
            {
                actionResponse.AddError("Số điện thoại đã tồn tại");
                return actionResponse;
            }
            #endregion


            request.CreatedDate = DateTime.Now;
            request.CreatedBy = _currentUser.UserName;

            var customerRequest = _mapper.Map<Domain.AggregateModels.Others.User>(request);
            customerRequest.Code = await _usersQueries.GetCodeByLastId(CodeEnum.Customer) ?? $"{CodeEnum.Customer.GetDescription()}{(1).ToString("D6")}";
            customerRequest.Type = TypeUserEnum.Customer.ToString();
            customerRequest.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
            customerRequest.RoleId = (await _roleRepository.FindByCode(RoleTypeEnum.CUSTOMER.ToString())).Id;
            customerRequest.IdentityGuid = Guid.NewGuid().ToString();
            customerRequest.Username = request.Phone;
            customerRequest.Password = "123@123aA";

            var createResponse = _userRepository.Create(customerRequest);
            actionResponse.Combine(createResponse);
            if (!createResponse.IsSuccess)
            {
                return actionResponse;
            }

            var customer = createResponse.Result;
            var validateUserResp = await _authService.ValidateUserAsync(customer!);
            if (!validateUserResp.Succeeded)
            {
                foreach (var err in validateUserResp.Errors)
                {
                    actionResponse.AddError(err.Description, err.Code);
                }
                return actionResponse;
            }

            customer.SecurityStamp = this.NewSecurityStamp();
            //mã hóa thuật toán PBKDF2
            customer.Password = _authService.EncryptPassword(customer.Password!);

            if (!string.IsNullOrEmpty(request.Email))
            {
                customer.VerifyToken = _authService.CreateVerifyToken();
                customer.VerifiedAt = DateTime.Now;
            }
            await _userRepository.SaveChangeAsync();

            // send email
            if (!string.IsNullOrEmpty(request.Email))
                emailHelper.SendEmailVerify(request.Email, customerRequest.FullName, customer.VerifyToken);


            actionResponse.SetResult(_mapper.Map<CustomerDTO>(customer));
            return actionResponse;
        }

        private string NewSecurityStamp()
        {
            byte[] bytes = new byte[20];
            _rng.GetBytes(bytes);
            return Base32.ToBase32(bytes);
        }
    }

    public class CreateCustomerFasterCommandValidator : AbstractValidator<CreateCustomerFasterCommand>
    {
        public CreateCustomerFasterCommandValidator()
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
        }
    }
}
