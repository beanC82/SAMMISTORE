using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.API.Services.MediaResource;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.Products;

namespace SAMMI.ECOM.API.Application.CommandHandlers.Other
{
    public class CreateImageCommandHandler : CustombaseCommandHandler<CreateImageCommand, ImageDTO>
    {
        private readonly IImageRepository _imageRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IConfiguration _config;
        public CreateImageCommandHandler(
            IImageRepository imageRepository,
            ICloudinaryService cloudinaryService,
            IConfiguration config,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _imageRepository = imageRepository;
            _cloudinaryService = cloudinaryService;
            _config = config;
        }

        public override async Task<ActionResponse<ImageDTO>> Handle(CreateImageCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<ImageDTO>();
            var folderMapping = new Dictionary<ImageEnum, string>
            {
                { ImageEnum.Product, _config["CloundSettings:ImageProductFolder"] },
                { ImageEnum.Brand, _config["CloundSettings:ImageBrandFolder"] },
                { ImageEnum.User, _config["CloundSettings:ImageUserFolder"] },
                { ImageEnum.Banner, _config["CloundSettings:ImageBannerFolder"] },
                { ImageEnum.Event, _config["CloundSettings:ImageEventFolder"] },
                { ImageEnum.Review, _config["CloundSettings:ImageReviewFolder"] },
            };
            string typeImage = "", folder = "", fileName = "", urlImage = "";
            if (!Enum.TryParse(request.TypeImage, true, out ImageEnum imageType))
            {
                imageType = ImageEnum.Product;
            }
            if (string.IsNullOrEmpty(request.Value?.ToString()) || request.Value == "string")
            {
                request.Value = null;
            }
            typeImage = imageType.ToString().ToLower();
            if (request.Value != null)
                fileName = $"{typeImage}_{request.Value}_{Guid.NewGuid()}";
            else
                fileName = $"{typeImage}_{Guid.NewGuid()}";
            folder = folderMapping.TryGetValue(imageType, out var mappedFolder)
                        ? mappedFolder
                        : _config["CloundSettings:ImageProductFolder"];
            urlImage = await _cloudinaryService.UploadBase64Image(request.ImageBase64, fileName, imageType.ToString());
            if (urlImage == null)
            {
                actResponse.AddError("Lỗi upload ảnh lên cloudinary");
                return actResponse;
            }

            request.ImageUrl = urlImage;
            request.PublicId = $"{folder}/{fileName}";
            request.CreatedBy = _currentUser.UserName;
            request.CreatedDate = DateTime.Now;
            var createImage = await _imageRepository.CreateAndSave(request);
            actResponse.Combine(createImage);
            actResponse.SetResult(_mapper.Map<ImageDTO>(createImage.Result));

            return actResponse;
        }
    }


    public class CreateImageCommandValidator : AbstractValidator<CreateImageCommand>
    {
        public CreateImageCommandValidator()
        {
            RuleFor(x => x.ImageBase64)
                .NotEmpty()
                .WithMessage("ImageBase64 không được bỏ trống")
                .Must(x => IsValidBase64(x))
                .WithMessage("Hình ảnh phải là chuỗi Base64 hợp lệ.");

            //RuleFor(x => x.PublicId)
            //    .NotEmpty()
            //    .WithMessage("PublicId không được bỏ trống");

            RuleFor(x => x.TypeImage)
                .NotEmpty()
                .WithMessage("Loại hình ảnh không được bỏ trống");
        }

        private static bool IsValidBase64(string base64)
        {
            Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
            return Convert.TryFromBase64String(base64, buffer, out int bytesParsed);
        }
    }
}
