using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Infrastructure.Queries.CategoryAddress;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;

namespace SAMMI.ECOM.API.Controllers.CategoryAddress
{
    [Route("api/[controller]")]
    [ApiController]
    public class DistrictsController : CustomBaseController
    {
        private readonly IDistrictQueries _districtQueries;
        private readonly IDistrictRepository _districtRepository;
        public DistrictsController(
            IDistrictQueries districtQueries,
            IDistrictRepository districtRepository,
            IMediator mediator,
            ILogger<UsersController> logger) : base(mediator, logger)
        {
            _districtQueries = districtQueries;
            _districtRepository = districtRepository;
        }

        //[AuthorizePermission(PermissionEnum.DistrictView)]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.Grid)
            {
                return Ok(await _districtQueries.GetList(request));
            }
            else if (request.Type == RequestType.Selection)
            {
                return Ok(await _districtQueries.GetSelectionList(request));
            }

            return Ok();
        }

        //[AuthorizePermission(PermissionEnum.DistrictView)]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _districtQueries.GetById(id));
        }


        //[HttpPost]
        //public async Task<IActionResult> Post([FromBody] CUDistrictCommand request)
        //{
        //    if (request.Id != 0)
        //    {
        //        return BadRequest();
        //    }
        //    var response = await _mediator.Send(request);
        //    if (response.IsSuccess)
        //    {
        //        return Ok(response);
        //    }
        //    return BadRequest(response);
        //}

        //[HttpPut("{id}")]
        //public async Task<IActionResult> Put(int id, [FromBody] CUDistrictCommand request)
        //{
        //    if (id != request.Id)
        //    {
        //        return BadRequest();
        //    }
        //    if (!_districtRepository.IsExisted(id))
        //    {
        //        return BadRequest("Quận/huyện không tồn tại.");
        //    }
        //    var response = await _mediator.Send(request);
        //    if (response.IsSuccess)
        //    {
        //        return Ok(response);
        //    }
        //    return BadRequest(response);
        //}

        //[HttpDelete("{id}")]
        //public IActionResult Delete(int id)
        //{
        //    if (!_districtRepository.IsExisted(id))
        //    {
        //        return BadRequest("Quận/huyện không tồn tại");
        //    }
        //    return Ok(_districtRepository.DeleteAndSave(id));
        //}

        //[HttpDelete]
        //public IActionResult DeleteRange([FromBody] List<int> ids)
        //{
        //    var actErrorResponse = new ActionResponse();
        //    if (ids == null || ids.Count == 0)
        //    {
        //        return BadRequest();
        //    }
        //    if (!ids.All(id => _districtRepository.IsExisted(id)))
        //    {
        //        actErrorResponse.AddError("Một số quận/huyện không tồn tại.");
        //        return BadRequest(actErrorResponse);
        //    }
        //    return Ok(_districtRepository.DeleteRangeAndSave(ids.Cast<object>().ToArray()));
        //}
    }
}
