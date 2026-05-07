using AutoMapper;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.API.Services.ElasticSearch;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.API.Application.CommandHandlers.Products
{
    public class CUBrandCommandHandler : CustombaseCommandHandler<CUBrandCommand, BrandDTO>
    {
        private readonly IBrandRepository _brandRepository;
        private readonly IMediator _mediator;
        private readonly IImageRepository _imageRepository;
        private readonly IElasticService<BrandDTO> _elasticService;
        public CUBrandCommandHandler(
            IBrandRepository brandRepository,
            IMediator mediator,
            IImageRepository imageRepository,
            IElasticService<BrandDTO> elasticService,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _brandRepository = brandRepository;
            _mediator = mediator;
            _imageRepository = imageRepository;
            _elasticService = elasticService;
        }

        public override async Task<ActionResponse<BrandDTO>> Handle(CUBrandCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<BrandDTO>();
            if (await _brandRepository.IsExistCode(request.Code, request.Id))
            {
                actResponse.AddError("Mã thương hiệu đã tồn tại");
                return actResponse;
            }
            if (await _brandRepository.IsExistName(request.Name, request.Id))
            {
                actResponse.AddError("Tên thương hiệu đã tồn tại");
                return actResponse;
            }

            if (request.Id == 0)
            {
                if (request.ImageCommand != null && !string.IsNullOrEmpty(request.ImageCommand.ImageBase64))
                {
                    request.ImageCommand.TypeImage = ImageEnum.Brand.ToString();
                    request.ImageCommand.Value = "";
                    var imageRes = await _mediator.Send(request.ImageCommand);
                    if (!imageRes.IsSuccess)
                    {
                        actResponse.AddError(imageRes.Message);
                        return actResponse;
                    }
                    request.ImageId = imageRes.Result.Id;
                }
                else
                {
                    request.ImageId = null;
                }

                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;

                var createResponse = await _brandRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<BrandDTO>(createResponse.Result));
            }
            else
            {
                ImageDTO imageDTO = null;
                var brand = await _brandRepository.GetByIdAsync(request.Id);
                request.ImageId = (request.ImageId == 0 || request.ImageId == null) ? null : request.ImageId;
                if (brand.ImageId != request.ImageId)
                {
                    actResponse.AddError("Không được thay đổi ImageId");
                    return actResponse;
                }
                if (request.ImageCommand != null && !string.IsNullOrEmpty(request.ImageCommand.ImageBase64))
                {
                    _imageRepository.DeleteAndSave(request.ImageId);
                    request.ImageCommand.TypeImage = ImageEnum.Brand.ToString();
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

                var updateRes = await _brandRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<BrandDTO>(updateRes.Result));
            }

            if (_elasticService != null && await _elasticService.IsConnected())
            {
                _elasticService.AddOrUpdate(IndexElasticEnum.Brand.GetDescription(), actResponse.Result);
            }

            return actResponse;
        }
    }


    public class CUBrandCommandValidator : AbstractValidator<CUBrandCommand>
    {
        public CUBrandCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã thương hiệu là bắt buộc");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên thương hiệu là bắt buộc");
        }
    }
}
