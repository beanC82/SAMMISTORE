using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;

namespace SAMMI.ECOM.API.Application.CommandHandlers
{
    public class CUProvinceCommandHandler : CustombaseCommandHandler<CUProvinceCommand, ProvinceDTO>
    {
        private readonly IProvinceRepository _provinRepository;

        public CUProvinceCommandHandler(IProvinceRepository provinRepository,
            UserIdentity currentUser, IMapper mapper) : base(currentUser, mapper)
        {
            _provinRepository = provinRepository;
        }

        public override async Task<ActionResponse<ProvinceDTO>> Handle(CUProvinceCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<ProvinceDTO>();

            if (await _provinRepository.CheckExistCode(request.Code, request.Id))
            {
                actResponse.AddError("Mã tỉnh/thành phố đã tồn tại");
                return actResponse;
            }
            if (await _provinRepository.CheckExistName(request.Name, request.Id))
            {
                actResponse.AddError("Tên tỉnh/thành phố đã tồn tại");
                return actResponse;
            }

            if (!string.IsNullOrEmpty(request.PostalCode) && await _provinRepository.CheckExistPosttalCode(request.PostalCode, request.Id))
            {
                actResponse.AddError("Mã bưu chính đã tồn tại");
                return actResponse;
            }

            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                var createResponse = await _provinRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<ProvinceDTO>(createResponse.Result));
            }
            else
            {
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _provinRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<ProvinceDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CUProvinceCommandValidator : AbstractValidator<CUProvinceCommand>
    {
        public CUProvinceCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã tỉnh/thành phố không được bỏ trống");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên tỉnh/thành phố không được bỏ trống");

            RuleFor(x => x.PostalCode)
                .NotEmpty()
                .WithMessage("Mã bưu chính không được bỏ trống.");
        }
    }
}
