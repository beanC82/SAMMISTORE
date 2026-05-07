using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Utillity;
using SAMMI.ECOM.Domain.AggregateModels;
using SAMMI.ECOM.Domain.Commands.User;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;
using SAMMI.ECOM.Infrastructure.Services.Auth;
using SAMMI.ECOM.Infrastructure.Services.Auth.Helpers;
using SAMMI.ECOM.Utility;
using System.Security.Cryptography;

namespace SAMMI.ECOM.API.Application.CommandHandlers.User
{
    public class CUCustomerCommandHandler : CustombaseCommandHandler<CUCustomerCommand, CustomerDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> _authService;
        private readonly IWardRepository _wardRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly ICustomerAddressRepository _addressRepository;
        private readonly IConfiguration _config;
        private readonly EmailHelper emailHelper;

        private static readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();

        public CUCustomerCommandHandler(
            IUsersRepository userRepository,
            IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> authService,
            IWardRepository wardRepository,
            IRoleRepository roleRepository,
            ICustomerAddressRepository addressRepository,
            IConfiguration config,
            UserIdentity currentUser, IMapper mapper) : base(currentUser, mapper)
        {
            _authService = authService;
            _userRepository = userRepository;
            _wardRepository = wardRepository;
            _roleRepository = roleRepository;
            _addressRepository = addressRepository;
            _config = config;
            emailHelper = new EmailHelper(config);
        }

        public override async Task<ActionResponse<CustomerDTO>> Handle(CUCustomerCommand request, CancellationToken cancellationToken)
        {
            var actionResponse = new ActionResponse<CustomerDTO>();
            #region validate
            if (request.Id == 0 && string.IsNullOrEmpty(request.Username))
            {
                actionResponse.AddError("Tên tài khoản không được bỏ trống");
                return actionResponse;
            }

            if (request.Id == 0 && string.IsNullOrEmpty(request.Password))
            {
                actionResponse.AddError("Mật khẩu không được bỏ trống");
                return actionResponse;
            }
            if (await _userRepository.IsExistCode(request.Code, request.Id))
            {
                actionResponse.AddError("Mã khách hàng đã tồn tại");
                return actionResponse;
            }

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

            // check foreign key
            if (request.WardId != null && !_wardRepository.IsExisted(request.WardId))
            {
                actionResponse.AddError("Không tìm thấy xã");
                return actionResponse;
            }

            if (request.Id == 0)
            {
                request.RoleId = (await _roleRepository.FindByCode(RoleTypeEnum.CUSTOMER.ToString())).Id;
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                request.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
                request.Type = TypeUserEnum.Customer.ToString();
                request.IdentityGuid = Guid.NewGuid().ToString();

                var createResponse = _userRepository.Create(request);
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

                customer.VerifyToken = _authService.CreateVerifyToken();
                customer.VerifiedAt = DateTime.Now;
                await _userRepository.SaveChangeAsync();

                // send email
                emailHelper.SendEmailVerify(request.Email, request.FullName, customer.VerifyToken);

                if (request.WardId != null && request.WardId != 0)
                {
                    var customerAddress = new CustomerAddress
                    {
                        CustomerId = customer.Id,
                        StreetAddress = customer.StreetAddress,
                        WardId = customer.WardId,
                        IsDefault = true,
                        CreatedDate = DateTime.Now,
                        CreatedBy = _currentUser.UserName
                    };
                    actionResponse.Combine(await _addressRepository.CreateAndSave(customerAddress));
                    if (!actionResponse.IsSuccess)
                    {
                        return actionResponse;
                    }
                }



                actionResponse.SetResult(_mapper.Map<CustomerDTO>(customer));
            }
            else
            {
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var customerUpdate = await _userRepository.UpdateAndSave(request);
                actionResponse.Combine(customerUpdate);
                if (!customerUpdate.IsSuccess)
                {
                    return actionResponse;
                }
                actionResponse.SetResult(_mapper.Map<CustomerDTO>(customerUpdate.Result));
            }
            return actionResponse;
        }

        private string NewSecurityStamp()
        {
            byte[] bytes = new byte[20];
            _rng.GetBytes(bytes);
            return Base32.ToBase32(bytes);
        }
    }

    public class CUCustomerCommandValidator : AbstractValidator<CUCustomerCommand>
    {
        public CUCustomerCommandValidator()
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
