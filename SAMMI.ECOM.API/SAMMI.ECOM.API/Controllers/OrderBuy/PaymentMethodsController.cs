using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;

namespace SAMMI.ECOM.API.Controllers.OrderBuy
{
    [Route("api/payment-method")]
    [ApiController]
    public class PaymentMethodsController : CustomBaseController
    {
        private readonly IPaymentMethodQueries _methodQueries;
        private readonly IPaymentMethodRepository _methodRepository;
        public PaymentMethodsController(
            IPaymentMethodQueries methodQueries,
            IPaymentMethodRepository methodRepository,
            IMediator mediator,
            ILogger<UsersController> logger) : base(mediator, logger)
        {
            _methodQueries = methodQueries;
            _methodRepository = methodRepository;
        }

        [AuthorizePermission(PermissionEnum.PaymentMethodView)]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.SimpleAll)
            {
                return Ok(await _methodQueries.GetAll(request));
            }
            else if (request.Type == RequestType.Selection)
            {
                return Ok(await _methodQueries.GetSelectionList(request));
            }
            return Ok(await _methodQueries.GetList(request));
        }

        [AuthorizePermission(PermissionEnum.PaymentMethodView)]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _methodQueries.GetById(id));
        }

        [AuthorizePermission(PermissionEnum.PaymentMethodCreate)]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CUPaymentMethodCommand request)
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

        //[HttpPut("{id}")]
        //public async Task<IActionResult> Put(int id, [FromBody] CUPaymentMethodCommand request)
        //{
        //    if (id != request.Id)
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

        //[HttpDelete("{id}")]
        //public IActionResult Delete(int id)
        //{
        //    if (!_methodRepository.IsExisted(id))
        //    {
        //        return NotFound();
        //    }
        //    return Ok(_methodRepository.DeleteAndSave(id));
        //}

        //[HttpDelete]
        //public IActionResult DeleteRange([FromBody] List<int> ids)
        //{
        //    var actErrorResponse = new ActionResponse<List<string>>();
        //    var listError = new Dictionary<int, string>();
        //    if (ids == null || ids.Count == 0)
        //    {
        //        return BadRequest();
        //    }
        //    foreach (var id in ids)
        //    {
        //        if (!_methodRepository.IsExisted(id) && !listError.TryGetValue(id, out var error))
        //        {
        //            listError[id] = $"Không tồn tại phương thức thanh toán có mã {id}";
        //        }
        //    }
        //    if (listError.Count > 0)
        //    {
        //        actErrorResponse.SetResult(listError.Select(x => x.Value).ToList());
        //        return BadRequest(actErrorResponse);
        //    }
        //    return Ok(_methodRepository.DeleteRangeAndSave(ids.Cast<object>().ToArray()));
        //}
    }
}
