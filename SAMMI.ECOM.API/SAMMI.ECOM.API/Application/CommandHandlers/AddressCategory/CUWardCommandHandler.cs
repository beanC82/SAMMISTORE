using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;

namespace SAMMI.ECOM.API.Application.CommandHandlers
{
    public class CUWardCommandHandler : CustombaseCommandHandler<CUWardCommand, WardDTO>
    {
        private readonly IWardRepository _wardRepository;
        private readonly IDistrictRepository _districtRepository;
        public CUWardCommandHandler(IWardRepository wardRepository,
            UserIdentity currentUser,
            IMapper mapper,
            IDistrictRepository districtRepository) : base(currentUser, mapper)
        {
            _wardRepository = wardRepository;
            _districtRepository = districtRepository;
        }

        public override async Task<ActionResponse<WardDTO>> Handle(CUWardCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<WardDTO>();
            if (await _wardRepository.CheckExistCode(request.Code, request.Id))
            {
                actResponse.AddError("Mã phường/xã đã tồn tại");
                return actResponse;
            }
            if (await _wardRepository.CheckExistName(request.Name, request.Id))
            {
                actResponse.AddError("Tên phường/xã đã tồn tại");
                return actResponse;
            }

            if (!_districtRepository.IsExisted(request.DistrictId))
            {
                actResponse.AddError("Mã quận/huyện không tồn tại");
                return actResponse;
            }

            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                var createResponse = await _wardRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<WardDTO>(createResponse.Result));
            }
            else
            {
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _wardRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<WardDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CUWardCommandValidator : AbstractValidator<CUWardCommand>
    {
        public CUWardCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã phường/xã không được bỏ trống");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên phường/xã không được bỏ trống");

            RuleFor(x => x.DistrictId)
                .NotNull()
                .WithMessage("Bắt buộc chọn quận/huyện.");
        }
    }
}
