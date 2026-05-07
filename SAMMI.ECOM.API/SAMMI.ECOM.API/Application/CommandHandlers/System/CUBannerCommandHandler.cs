using AutoMapper;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.System;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Infrastructure.Repositories.System;

namespace SAMMI.ECOM.API.Application.CommandHandlers.System
{
    public class CUBannerCommandHandler : CustombaseCommandHandler<CUBannerCommand, BannerDTO>
    {
        private readonly IBannerRepository _bannerRepository;
        private readonly IMediator _mediator;
        private readonly IImageRepository _imageRepository;

        public CUBannerCommandHandler(
            IBannerRepository bannerRepository,
            IMediator mediator,
            IImageRepository imageRepository,
            UserIdentity currentUser, IMapper mapper) : base(currentUser, mapper)
        {
            _bannerRepository = bannerRepository;
            _mediator = mediator;
            _imageRepository = imageRepository;
        }

        public override async Task<ActionResponse<BannerDTO>> Handle(CUBannerCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<BannerDTO>();


            if (request.Id == 0)
            {
                if (request.ImageCommand == null || string.IsNullOrEmpty(request.ImageCommand.ImageBase64))
                {
                    actResponse.AddError("Hình ảnh banner không được bỏ trống");
                    return actResponse;
                }
                // set value for image
                request.ImageCommand.TypeImage = ImageEnum.Banner.ToString();
                request.ImageCommand.Value = "";
                var imageRes = await _mediator.Send(request.ImageCommand);
                if (!imageRes.IsSuccess)
                {
                    actResponse.AddError(imageRes.Message);
                    return actResponse;
                }
                request.ImageId = imageRes.Result.Id;
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                var createResponse = await _bannerRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<BannerDTO>(createResponse.Result));
            }
            else
            {
                ImageDTO imageDTO = null;
                request.ImageId = (request.ImageId == 0 || request.ImageId == null) ? null : request.ImageId;
                var banner = await _bannerRepository.GetByIdAsync(request.Id);
                if (banner.ImageId != request.ImageId)
                {
                    actResponse.AddError("Không được thay đổi ImageId");
                    return actResponse;
                }
                if (request.ImageCommand != null && !string.IsNullOrEmpty(request.ImageCommand.ImageBase64))
                {
                    _imageRepository.DeleteAndSave(request.ImageId);
                    request.ImageCommand.TypeImage = ImageEnum.Banner.ToString();
                    request.ImageCommand.Value = "";
                    request.ImageCommand.Id = 0;
                    var imageRes = await _mediator.Send(request.ImageCommand);
                    if (!imageRes.IsSuccess)
                    {
                        actResponse.AddError(imageRes.Message);
                        return actResponse;
                    }
                    imageDTO = imageRes.Result;
                }

                if (imageDTO != null)
                {
                    request.ImageId = imageDTO.Id;
                }
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _bannerRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<BannerDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CUBannerCommandValidator : AbstractValidator<CUBannerCommand>
    {
        public CUBannerCommandValidator()
        {
            RuleFor(x => x.Level)
                .Must(x => x > 0)
                .WithMessage("Vị trí/Cấp độ phải lớn hơn 0");
        }
    }
}
