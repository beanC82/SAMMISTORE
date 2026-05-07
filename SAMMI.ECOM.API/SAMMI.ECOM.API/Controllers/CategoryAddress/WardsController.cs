using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Infrastructure.Queries.CategoryAddress;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;

namespace SAMMI.ECOM.API.Controllers.CategoryAddress
{
    [Route("api/[controller]")]
    [ApiController]
    public class WardsController : CustomBaseController
    {
        private readonly IWardQueries _wardQueries;
        private readonly IWardRepository _wardRepository;
        public WardsController(
            IWardQueries WardQueries,
            IWardRepository wardRepository,
            IMediator mediator,
            ILogger<UsersController> logger) : base(mediator, logger)
        {
            _wardQueries = WardQueries;
            _wardRepository = wardRepository;
        }

        //[AuthorizePermission(PermissionEnum.WardView)]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.Grid)
            {
                return Ok(await _wardQueries.GetList(request));
            }
            else if (request.Type == RequestType.Selection)
            {
                return Ok(await _wardQueries.GetSelectionList(request));
            }

            return Ok();
        }

        //[AuthorizePermission(PermissionEnum.WardView)]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _wardQueries.GetById(id));
        }

        //[HttpPost]
        //public async Task<IActionResult> Post([FromBody] CUWardCommand request)
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
        //public async Task<IActionResult> Put(int id, [FromBody] CUWardCommand request)
        //{
        //    if (id != request.Id)
        //    {
        //        return BadRequest();
        //    }
        //    if (!_wardRepository.IsExisted(id))
        //    {
        //        return BadRequest("Phường/xã không tồn tại.");
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
        //    if (!_wardRepository.IsExisted(id))
        //    {
        //        return BadRequest("Phường/xã không tồn tại.");
        //    }
        //    return Ok(_wardRepository.DeleteAndSave(id));
        //}

        //[HttpDelete]
        //public IActionResult DeleteRange([FromBody] List<int> ids)
        //{
        //    var actErrorResponse = new ActionResponse();
        //    if (ids == null || ids.Count == 0)
        //    {
        //        return BadRequest();
        //    }
        //    if (!ids.All(id => _wardRepository.IsExisted(id)))
        //    {
        //        actErrorResponse.AddError("Một số phường/xã không tồn tại.");
        //        return BadRequest(actErrorResponse);
        //    }
        //    return Ok(_wardRepository.DeleteRangeAndSave(ids.Cast<object>().ToArray()));
        //}
    }
}
