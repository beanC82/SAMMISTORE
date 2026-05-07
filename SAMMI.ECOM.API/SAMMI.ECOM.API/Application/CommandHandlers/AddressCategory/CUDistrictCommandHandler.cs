using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;

namespace SAMMI.ECOM.API.Application.CommandHandlers
{
    public class CUDistrictCommandHandler : CustombaseCommandHandler<CUDistrictCommand, DistrictDTO>
    {
        private readonly IDistrictRepository _districtRepository;
        private readonly IProvinceRepository _provinceRepository;
        public CUDistrictCommandHandler(IDistrictRepository districtRepository,
            UserIdentity currentUser,
            IMapper mapper,
            IProvinceRepository provinceRepository) : base(currentUser, mapper)
        {
            _districtRepository = districtRepository;
            _provinceRepository = provinceRepository;
        }

        public override async Task<ActionResponse<DistrictDTO>> Handle(CUDistrictCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<DistrictDTO>();
            if (await _districtRepository.CheckExistCode(request.Code, request.Id))
            {
                actResponse.AddError("Mã quận/huyện đã tồn tại");
                return actResponse;
            }
            if (await _districtRepository.CheckExistName(request.Name, request.Id))
            {
                actResponse.AddError("Tên quận/huyện đã tồn tại");
                return actResponse;
            }

            if (!_provinceRepository.IsExisted(request.ProvinceId))
            {
                actResponse.AddError("Mã tỉnh/thành phố không tồn tại");
                return actResponse;
            }

            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                var createResponse = await _districtRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<DistrictDTO>(createResponse.Result));
            }
            else
            {
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _districtRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<DistrictDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CUDistrictCommandValidator : AbstractValidator<CUDistrictCommand>
    {
        public CUDistrictCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã quận/huyện không được bỏ trống");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên quận/huyện không được bỏ trống");
        }
    }
}
