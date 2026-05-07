using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;

namespace SAMMI.ECOM.API.Controllers.OrderBuy
{
    [Route("api/discount-type")]
    [ApiController]
    public class DiscountTypesController : CustomBaseController
    {
        private readonly IDiscountTypeQueries _typeQueries;
        private readonly IDiscountTypeRepository _typeRepository;
        public DiscountTypesController(
            IDiscountTypeQueries typeQueries,
            IDiscountTypeRepository typeRepository,
            IMediator mediator,
            ILogger<UsersController> logger) : base(mediator, logger)
        {
            _typeQueries = typeQueries;
            _typeRepository = typeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.SimpleAll)
            {
                return Ok(await _typeQueries.GetAll(request));
            }
            else if (request.Type == RequestType.Selection)
            {
                return Ok(await _typeQueries.GetSelectionList(request));
            }
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _typeQueries.GetById(id));
        }
    }
}
