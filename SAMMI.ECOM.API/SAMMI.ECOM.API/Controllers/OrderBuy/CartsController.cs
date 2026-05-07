using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Services.Caching;

namespace SAMMI.ECOM.API.Controllers.OrderBuy
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : CustomBaseController
    {
        private readonly ICartQueries _cartQueries;
        private readonly ICartDetailQueries _cartDetailQueries;
        private readonly ICartDetailRepository _detailRepository;
        private readonly IRedisService<List<CartDetailDTO>>? _redisService;
        private readonly IConfiguration _config;
        public CartsController(
            ICartQueries cartQueries,
            ICartDetailQueries cartDetailQueries,
            ICartDetailRepository cartDetailRepository,
            UserIdentity userIdentity,
            IRedisService<List<CartDetailDTO>> redisService,
            IConfiguration config,
            IMediator mediator,
            ILogger<UsersController> logger) : base(mediator, logger)
        {
            _cartQueries = cartQueries;
            _cartDetailQueries = cartDetailQueries;
            _detailRepository = cartDetailRepository;
            UserIdentity = userIdentity;
            _redisService = redisService;
            _config = config;
        }

        [AuthorizePermission(PermissionEnum.CustomerCartView)]
        [HttpGet("get-cart")]
        public async Task<IActionResult> GetCart()
        {
            var cartKey = $"{_config["RedisOptions:cart_key"]}{UserIdentity.Id}";
            if (_redisService != null && _redisService.IsConnected() && _redisService.IsConnected())
            {
                var cachedCart = await _redisService.GetCache<List<CartDetailDTO>>(cartKey);
                if (cachedCart != null && cachedCart.Count > 0)
                {
                    return Ok(cachedCart);
                }
            }

            var cartItems = (await _cartDetailQueries.GetMyCart()).ToList();
            if (cartItems != null && cartItems.Count > 0 && _redisService != null && _redisService.IsConnected())
            {
                await _redisService.SetCache(cartKey, cartItems, TimeSpan.FromDays(10));
            }
            return Ok(cartItems);
        }

        //customer
        [AuthorizePermission(PermissionEnum.CustomerCartAdd)]
        [HttpPost("add-to-cart")]
        public async Task<IActionResult> AddToCart([FromBody] CreateCartDetailCommand request)
        {
            if (request.Id != 0)
            {
                return BadRequest();
            }
            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                await _cartDetailQueries.CacheCart(UserIdentity.Id);
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.CustomerCartRemove)]
        [HttpDelete("{productId}")]
        public async Task<IActionResult> DeleteProductFromCart(int productId)
        {
            var cartDetail = await _detailRepository.GetByUserIdAndProductId(UserIdentity.Id, productId);
            if (cartDetail == null)
            {
                return BadRequest("Không tồn tại sản phẩm trong giỏ hàng");
            }
            var removeRes = _detailRepository.DeleteAndSave(cartDetail.Id);
            if (!removeRes.IsSuccess)
            {
                return BadRequest(removeRes);
            }
            await _cartDetailQueries.CacheCart(UserIdentity.Id);
            return Ok(removeRes);
        }

        [HttpGet("get-order-select-products")]
        public async Task<IActionResult> GetOrderBySelectProductAsync([FromQuery] string ProductIds)
        {
            var actionRes = new ActionResponse<List<CartDetailDTO>>();
            var invalidEntries = ProductIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Where(s => !int.TryParse(s, out _))
                .ToList();
            if (invalidEntries.Any())
            {
                actionRes.AddError("Giá trị truyền vào không hợp lệ, phải là số nguyên");
                return BadRequest(actionRes);
            }
            List<int> ids = ProductIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                        .Select(int.Parse)
                                        .Distinct()
                                        .ToList();
            var cartKey = $"{_config["RedisOptions:cart_key"]}{UserIdentity.Id}";
            if (_redisService != null && _redisService.IsConnected() && _redisService.IsConnected())
            {
                var cachedCart = await _redisService.GetCache<List<CartDetailDTO>>(cartKey);
                if (!ids.All(id => cachedCart.Any(x => x.ProductId == id)))
                {
                    actionRes.AddError("Sản phẩm không tồn tại trong giỏ hàng");
                    return BadRequest(actionRes);
                }
                if (cachedCart != null && cachedCart.Count > 0)
                {
                    return Ok(cachedCart.Where(x => ids.Contains(x.ProductId)));
                }
            }

            foreach (var id in ids)
            {
                if (!await _detailRepository.IsExisted(UserIdentity.Id, id))
                {
                    actionRes.AddError("Sản phẩm không tồn tại trong giỏ hàng");
                    return BadRequest(actionRes);
                }
            }
            var cartItems = (await _cartDetailQueries.GetMyCart(ids)).ToList();
            if (cartItems != null && cartItems.Count > 0 && _redisService != null && _redisService.IsConnected())
            {
                await _redisService.SetCache(cartKey, cartItems, TimeSpan.FromDays(10));
            }
            return Ok(cartItems);
        }
    }
}
