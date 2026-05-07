using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Services.MediaResource;
using SAMMI.ECOM.Domain.DomainModels.Shipping;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;
using SAMMI.ECOM.Infrastructure.Services.GHN_API;

namespace SAMMI.ECOM.API.Controllers
{
    public class GHNController : CustomBaseController
    {
        private readonly IGHNService _ghnService;
        private readonly IWardRepository _wardRepository;
        private readonly IConfiguration _config;
        private readonly ICloudinaryService _cloudinaryService;
        public GHNController(
            IGHNService ghnService,
            IWardRepository wardRepository,
            IConfiguration config,
            ICloudinaryService cloudinaryService,
            IMediator mediator,
            ILogger<GHNController> logger) : base(mediator, logger)
        {
            _ghnService = ghnService;
            _wardRepository = wardRepository;
            _config = config;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProvince()
        {
            return Ok(await _ghnService.GetProvinces());
        }

        [HttpGet("calculate-fee")]
        public async Task<IActionResult> CalculateFee(int wardId, decimal? totalAmount)
        {
            var ward = await _wardRepository.GetById(wardId);
            if (ward == null)
                return BadRequest("Mã phường không tồn tại.");
            var request = new FeeRequestDTO
            {
                InnsuranceValue = totalAmount,
                ToDistrictID = ward.DistrictId ?? 0,
                ToWardCode = ward.Code
            };
            var response = await _ghnService.CalculateFee(request);
            if (response == null)
                return BadRequest();
            return Ok(response);
        }

        [HttpGet("service/{wardId}")]
        public async Task<IActionResult> GetService(int wardId)
        {
            var ward = await _wardRepository.GetById(wardId);
            if (ward == null)
            {
                return BadRequest("Phường/xã không tồn tại.");
            }

            return Ok(await _ghnService.GetServices(_config.GetValue<int>("GHN_API:DistrictId"), ward.DistrictId ?? 1));
        }

        [HttpPost("upload-images")]
        [AllowAnonymous]
        public async Task<IActionResult> UploadImageAsync(List<IFormFile> files, [FromQuery] ImageEnum type)
        {
            if (files == null || !files.Any())
            {
                return BadRequest("Danh sách tệp không được để trống.");
            }
            var result = await _cloudinaryService.UploadImages(files, type);
            return Ok();
        }
    }
}
