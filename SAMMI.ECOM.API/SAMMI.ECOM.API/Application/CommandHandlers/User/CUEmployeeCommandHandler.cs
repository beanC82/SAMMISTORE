using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Utillity;
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
    public class CreateEmployeeCommandHandler : CustombaseCommandHandler<CreateEmployeeCommand, EmployeeDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> _authService;
        private readonly IWardRepository _wardRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IConfiguration _config;
        private readonly EmailHelper emailHelper;
        public CreateEmployeeCommandHandler(
            IUsersRepository userRepository,
            IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> authService,
            IWardRepository wardRepository,
            IRoleRepository roleRepository,
            IConfiguration config,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _authService = authService;
            _userRepository = userRepository;
            _wardRepository = wardRepository;
            _roleRepository = roleRepository;
            _config = config;
            emailHelper = new EmailHelper(config);
        }

        private static readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();


        public override async Task<ActionResponse<EmployeeDTO>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        {
            var actionResponse = new ActionResponse<EmployeeDTO>();

            #region validate
            if (await _userRepository.IsExistCode(request.Code, request.Id))
            {
                actionResponse.AddError("Mã nhân viên đã tồn tại");
                return actionResponse;
            }

            if (!string.IsNullOrEmpty(request.Email) && await _userRepository.IsExistEmail(request.Email, request.Id))
            {
                actionResponse.AddError("Email đã tồn tại");
                return actionResponse;
            }

            if (!string.IsNullOrEmpty(request.Phone) && await _userRepository.IsExistPhone(request.Phone, request.Id))
            {
                actionResponse.AddError("Số điện thoại đã tồn tại");
                return actionResponse;
            }
            #endregion

            // check foreign key
            if (!_wardRepository.IsExisted(request.WardId))
            {
                actionResponse.AddError("Không tìm thấy xã");
                return actionResponse;
            }
            if (!_roleRepository.IsExisted(request.RoleId))
            {
                actionResponse.AddError("Vai trò không tồn tại");
                return actionResponse;
            }

            request.CreatedDate = DateTime.Now;
            request.CreatedBy = _currentUser.UserName;
            request.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
            request.Type = TypeUserEnum.Employee.ToString();
            request.IdentityGuid = Guid.NewGuid().ToString();

            var createResponse = _userRepository.Create(request);
            actionResponse.Combine(createResponse);
            if (!createResponse.IsSuccess)
            {
                return actionResponse;
            }

            var employee = createResponse.Result;

            var validateUserResp = await _authService.ValidateUserAsync(employee!);
            if (!validateUserResp.Succeeded)
            {
                foreach (var err in validateUserResp.Errors)
                {
                    actionResponse.AddError(err.Description, err.Code);
                }
                return actionResponse;
            }

            employee.SecurityStamp = this.NewSecurityStamp();
            //mã hóa thuật toán PBKDF2
            employee.Password = _authService.EncryptPassword(employee.Password!);

            employee.VerifyToken = _authService.CreateVerifyToken();
            employee.VerifiedAt = DateTime.Now;
            await _userRepository.SaveChangeAsync();

            // send email
            emailHelper.SendEmailVerify(request.Email, request.FullName, employee.VerifyToken);
            await _userRepository.SaveChangeAsync();

            // add role và send password email(nếu có)

            actionResponse.SetResult(_mapper.Map<EmployeeDTO>(employee));
            return actionResponse;
        }

        private string NewSecurityStamp()
        {
            byte[] bytes = new byte[20];
            _rng.GetBytes(bytes);
            return Base32.ToBase32(bytes);
        }
    }


    public class UpdateEmployeeCommandHandler : CustombaseCommandHandler<UpdateEmployeeCommand, EmployeeDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IWardRepository _wardRepository;
        public UpdateEmployeeCommandHandler(IUsersRepository userRepository,
            IWardRepository wardRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _userRepository = userRepository;
            _wardRepository = wardRepository;
        }


        public override async Task<ActionResponse<EmployeeDTO>> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
        {
            var actionResponse = new ActionResponse<EmployeeDTO>();

            #region validate
            if (await _userRepository.IsExistCode(request.Code, request.Id))
            {
                actionResponse.AddError("Mã nhân viên đã tồn tại");
                return actionResponse;
            }

            if (!string.IsNullOrEmpty(request.Email) && await _userRepository.IsExistEmail(request.Email, request.Id))
            {
                actionResponse.AddError("Email đã tồn tại");
                return actionResponse;
            }

            if (!string.IsNullOrEmpty(request.Phone) && await _userRepository.IsExistPhone(request.Phone, request.Id))
            {
                actionResponse.AddError("Số điện thoại đã tồn tại");
                return actionResponse;
            }
            #endregion

            // check foreign key
            if (!_wardRepository.IsExisted(request.WardId))
            {
                actionResponse.AddError("Không tìm thấy xã");
                return actionResponse;
            }

            var employee = await _userRepository.FindById(request.Id);

            employee.UpdatedDate = DateTime.Now;
            employee.UpdatedBy = _currentUser.UserName;
            employee.Code = request.Code;
            employee.FirstName = request.FirstName;
            employee.LastName = request.LastName;
            employee.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
            employee.Email = request.Email;
            employee.Phone = request.Phone;
            employee.StreetAddress = request.StreetAddress;
            employee.WardId = request.WardId;
            employee.Gender = request.Gender;

            var employeeUpdate = await _userRepository.UpdateAndSave(employee);
            actionResponse.Combine(employeeUpdate);
            if (!employeeUpdate.IsSuccess)
            {
                return actionResponse;
            }
            actionResponse.SetResult(_mapper.Map<EmployeeDTO>(employeeUpdate.Result));
            return actionResponse;

        }
    }

    public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
    {
        public CreateEmployeeCommandValidator()
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

            RuleFor(x => x.Username)
                .NotEmpty()
                .WithMessage("Tên tài khoản không bỏ trống");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Mật khẩu không được bỏ trống");

            RuleFor(x => x.RoleId)
                .Must(x => x != 0 && x != null)
                .WithMessage("Chọn vai trò là bắt buộc");
        }


    }

    public class UpdateEmployeeCommandValidator : AbstractValidator<UpdateEmployeeCommand>
    {
        public UpdateEmployeeCommandValidator()
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

            RuleFor(x => x.IdCardNumber)
                .NotEmpty()
                .WithMessage("CCCD không được bỏ trống")
                .Length(12)
                .WithMessage("Số CCCD phải có đúng 12 chữ số")
                .Matches(@"^\d{12}$")
                .WithMessage("Số CCCD chỉ được chứa chữ số");

            RuleFor(x => x.RoleId)
                .Must(x => x != 0 && x != null)
                .WithMessage("Chọn vai trò là bắt buộc");
        }
    }
}
