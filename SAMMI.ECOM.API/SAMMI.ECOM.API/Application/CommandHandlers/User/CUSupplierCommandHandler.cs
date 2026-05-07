using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.User;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;
using SAMMI.ECOM.Infrastructure.Services.Auth;
using SAMMI.ECOM.Utility;
using System.Security.Cryptography;

namespace SAMMI.ECOM.API.Application.CommandHandlers.User
{
    public class CUSupplierCommandHandler : CustombaseCommandHandler<CUSupplierCommand, SupplierDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> _authService;
        private readonly IWardRepository _wardRepository;

        private static readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();

        public CUSupplierCommandHandler(
            IUsersRepository userRepository,
            IAuthenticationService<SAMMI.ECOM.Domain.AggregateModels.Others.User> authService,
            IWardRepository wardRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _authService = authService;
            _userRepository = userRepository;
            _wardRepository = wardRepository;
        }

        public override async Task<ActionResponse<SupplierDTO>> Handle(CUSupplierCommand request, CancellationToken cancellationToken)
        {
            var actionResponse = new ActionResponse<SupplierDTO>();
            #region validate
            if (await _userRepository.IsExistCode(request.Code, request.Id))
            {
                actionResponse.AddError("Mã nhà cung cấp đã tồn tại");
                return actionResponse;
            }

            if (!string.IsNullOrEmpty(request.Email) && await _userRepository.IsExistEmail(request.Email, request.Id, TypeUserEnum.Supplier))
            {
                actionResponse.AddError("Email đã tồn tại");
                return actionResponse;
            }

            if (!string.IsNullOrEmpty(request.Phone) && await _userRepository.IsExistPhone(request.Phone, request.Id, TypeUserEnum.Supplier))
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

            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                request.Type = TypeUserEnum.Supplier.ToString();
                request.IdentityGuid = Guid.NewGuid().ToString();

                var createResponse = await _userRepository.CreateAndSave(request);
                actionResponse.Combine(createResponse);
                if (!createResponse.IsSuccess)
                {
                    return actionResponse;
                }
                actionResponse.SetResult(_mapper.Map<SupplierDTO>(createResponse.Result));
            }
            else
            {
                //var supplier = await _userRepository.FindById(request.Id);

                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;
                //supplier.Code = request.Code;
                //supplier.FirstName = request.FirstName;
                //supplier.LastName = request.LastName;
                //supplier.Email = request.Email;
                //supplier.Phone = request.Phone;
                //supplier.StreetAddress = request.StreetAddress;
                //supplier.WardId = request.WardId;
                //supplier.Gender = request.Gender;

                var supplierUpdate = await _userRepository.UpdateAndSave(request);
                actionResponse.Combine(supplierUpdate);
                if (!supplierUpdate.IsSuccess)
                {
                    return actionResponse;
                }
                actionResponse.SetResult(_mapper.Map<SupplierDTO>(supplierUpdate.Result));
            }
            return actionResponse;
        }
    }

    public class CUSupplierCommandValidator : AbstractValidator<CUSupplierCommand>
    {
        public CUSupplierCommandValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Tên nhà cung cấp không được bỏ trống");

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
