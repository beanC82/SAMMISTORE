using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.System;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.System;
using SAMMI.ECOM.Infrastructure.Repositories.System;

namespace SAMMI.ECOM.API.Controllers.System
{
    [Route("api/[controller]")]
    [ApiController]
    public class BannersController : CustomBaseController
    {
        private readonly IBannerQueries _bannerceQueries;
        private readonly IBannerRepository _bannerRepository;
        public BannersController(
            IBannerQueries bannerceQueries,
            IBannerRepository bannerRepository,
            IMediator mediator,
            ILogger<UsersController> logger) : base(mediator, logger)
        {
            _bannerceQueries = bannerceQueries;
            _bannerRepository = bannerRepository;
        }

        [AuthorizePermission(PermissionEnum.BannerView)]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.SimpleAll)
            {
                return Ok(await _bannerceQueries.GetAll(request));
            }
            return Ok(await _bannerceQueries.GetList(request));
        }

        [AuthorizePermission(PermissionEnum.BannerView)]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _bannerceQueries.GetById(id));
        }

        [AuthorizePermission(PermissionEnum.BannerCreate)]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CUBannerCommand request)
        {
            if (request.Id != 0)
            {
                return BadRequest();
            }
            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.BannerUpdate)]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CUBannerCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }
            if (!_bannerRepository.IsExisted(id))
            {
                return BadRequest("Banner không tồn tại.");
            }
            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.BannerDelete)]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_bannerRepository.IsExisted(id))
            {
                return BadRequest("Banner không tồn tại");
            }
            return Ok(_bannerRepository.DeleteAndSave(id));
        }

        [AuthorizePermission(PermissionEnum.BannerDelete)]
        [HttpDelete]
        public IActionResult DeleteRange([FromBody] List<int> ids)
        {
            var actErrorResponse = new ActionResponse();
            if (ids == null || ids.Count == 0)
            {
                return BadRequest();
            }
            if (!ids.All(id => _bannerRepository.IsExisted(id)))
            {
                actErrorResponse.AddError("Một số banner không tồn tại.");
                return BadRequest(actErrorResponse);
            }

            return Ok(_bannerRepository.DeleteRangeAndSave(ids.Cast<object>().ToArray()));
        }

        [AllowAnonymous]
        [HttpGet("get-banners")]
        public async Task<IActionResult> GetBannersAsync(int numberTop = 3)
        {
            var filterModel = new RequestFilterModel()
            {
                Take = numberTop
            };
            return Ok(await _bannerceQueries.GetBanners(filterModel));
        }
    }
}
