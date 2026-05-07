using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.FavouriteProducts;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Infrastructure.Services;
using SAMMI.ECOM.Infrastructure.Services.Caching;

namespace SAMMI.ECOM.API.Controllers.Products
{
    [Route("api/favourite-product")]
    [ApiController]
    public class FavouriteProductsController : CustomBaseController
    {
        private readonly IFavouriteProductQueries _favouriteQueries;
        private readonly IProductRepository _productRepository;
        private readonly IFavouriteProductRepository _favouriteRepository;
        private readonly IRedisService<List<FavouriteProductDTO>>? _redisService;
        private string cacheKey;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly IImageRepository _imageRepository;
        private readonly ICookieService _cookieService;
        private readonly IMemoryCacheService _memoryCacheService;
        public FavouriteProductsController(
            IFavouriteProductQueries favouriteQueries,
            IProductRepository productRepository,
            UserIdentity currentUser,
            IFavouriteProductRepository favouriteRepository,
            IRedisService<List<FavouriteProductDTO>>? redisService,
            IConfiguration config,
            IMapper mapper,
            IMediator mediator,
            IImageRepository imageRepository,
            ICookieService cookieService,
            IMemoryCacheService memoryCacheService,
            ILogger<FavouriteProductsController> logger) : base(mediator, logger)
        {
            _favouriteQueries = favouriteQueries;
            _productRepository = productRepository;
            UserIdentity = currentUser;
            _favouriteRepository = favouriteRepository;
            _redisService = redisService;
            _config = config;
            cacheKey = $"{_config["RedisOptions:favourite_key"]}{UserIdentity.Id}";
            _mapper = mapper;
            _imageRepository = imageRepository;
            _cookieService = cookieService;
            _memoryCacheService = memoryCacheService;
        }


        [AuthorizePermission(PermissionEnum.CustomerFavoriteProductsManage)]
        [HttpGet]
        public async Task<IActionResult> GetAsync([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.Grid)
            {
                return Ok(await _favouriteQueries.GetList(request));
            }
            else if (request.Type == RequestType.SimpleAll)
            {
                if (_redisService != null && _redisService.IsConnected())
                {
                    var cachedList = await _redisService.GetCache<List<FavouriteProductDTO>>(cacheKey);
                    if (cachedList != null && cachedList.Count > 0)
                    {
                        return Ok(cachedList);
                    }
                }

                var favouriteList = await _favouriteQueries.GetAll(UserIdentity.Id, request);
                if (_redisService != null && _redisService.IsConnected() && favouriteList != null && favouriteList.Any())
                {
                    _redisService.SetCache(cacheKey, favouriteList);
                }

                // set cookie
                //var productFavouriteId = _cookieService.GetFavouriteProduct();
                //if (productFavouriteId == null)
                //{
                //    productFavouriteId = new List<int>();
                //}
                //foreach(var id in favouriteList.Select(x => x.ProductId))
                //{
                //    if (!productFavouriteId.Contains(id))
                //    {
                //        productFavouriteId.Add(id);
                //    }
                //}
                //if (productFavouriteId != null)
                //{
                //    _cookieService.SaveFavouriteProduct(productFavouriteId);
                //}

                var favouriteProductIds = _memoryCacheService.GetFavouriteProduct();
                if (favouriteProductIds == null || !favouriteProductIds.Any())
                {
                    var productIds = await _favouriteRepository.GetProductInFavourite(UserIdentity.Id);
                    if (productIds != null && productIds.Any())
                    {
                        _memoryCacheService.SetFavouriteProduct(productIds);
                    }
                }
                return Ok(favouriteList);
            }
            return Ok();
        }

        [AuthorizePermission(PermissionEnum.CustomerFavoriteProductsManage)]
        [HttpPost("{productId}")]
        public async Task<IActionResult> PostAsync(int productId)
        {
            var actionRes = new ActionResponse<FavouriteProductDTO>();
            if (!_productRepository.IsExisted(productId))
            {
                actionRes.AddError("Sản phẩm không tồn tại");
                return BadRequest(actionRes);
            }
            if (await _favouriteRepository.IsExisted(UserIdentity.Id, productId))
            {
                actionRes.AddError("Sản phẩm này đã được lưu trong kho yêu thích");
                return BadRequest(actionRes);
            }
            var request = new FavouriteProduct
            {
                ProductId = productId,
                CustomerId = UserIdentity.Id,
                CreatedDate = DateTime.Now,
                CreatedBy = "System"
            };
            var createRes = await _favouriteRepository.CreateAndSave(request);
            actionRes.Combine(createRes);
            var favouriteResult = createRes.Result;
            if (actionRes.IsSuccess)
            {
                var favouriteDTO = _mapper.Map<FavouriteProductDTO>(favouriteResult);
                favouriteDTO.ProductName = favouriteResult.Product.Name;
                favouriteDTO.StockQuantity = favouriteResult.Product.StockQuantity;
                favouriteDTO.Price = favouriteResult.Product.Price;
                favouriteDTO.NewPrice = Math.Round(
                    (favouriteResult.Product.StartDate?.AddTicks(0) <= DateTime.Now && favouriteResult.Product.EndDate >= DateTime.Now)
                        ? (decimal)(favouriteResult.Product.Price * (1 - favouriteResult.Product.Discount))
                        : favouriteResult.Product?.Price ?? 0, 2);
                favouriteDTO.ProductImage = (await _imageRepository.GetAvatarProduct(productId)).ImageUrl;
                if (_redisService != null && _redisService.IsConnected())
                {
                    var cachedList = await _redisService.GetCache<List<FavouriteProductDTO>>(cacheKey);
                    if (cachedList != null)
                        cachedList = new List<FavouriteProductDTO>();
                    cachedList.Add(favouriteDTO);
                    await _redisService.SetCache(cacheKey, cachedList, TimeSpan.FromDays(10));
                }
                actionRes.SetResult(favouriteDTO);

                // save cookie
                //var productFavouriteId = _cookieService.GetFavouriteProduct();
                //if (productFavouriteId == null)
                //{
                //    productFavouriteId = new List<int>();
                //}
                //if (!productFavouriteId.Contains(favouriteDTO.ProductId))
                //{
                //    productFavouriteId.Add(favouriteDTO.ProductId);
                //    _cookieService.SaveFavouriteProduct(productFavouriteId);
                //}

                //save memory
                var productIds = await _favouriteRepository.GetProductInFavourite(UserIdentity.Id);
                if (productIds != null && productIds.Any())
                {
                    _memoryCacheService.SetFavouriteProduct(productIds);
                }

                return Ok(actionRes);
            }
            return BadRequest(actionRes);
        }

        [AuthorizePermission(PermissionEnum.CustomerFavoriteProductsManage)]
        [HttpDelete("{productId}")]
        public async Task<IActionResult> DeleteAsync(int productId)
        {
            var favourite = await _favouriteRepository.GetByCustomerAndProduct(UserIdentity.Id, productId);
            if (favourite == null)
            {
                return BadRequest("Sản phẩm không tồn tại trong danh sách yêu thích");
            }
            var deleteRes = _favouriteRepository.DeleteAndSave(favourite.Id);
            if (deleteRes.IsSuccess)
            {
                if (_redisService != null && _redisService.IsConnected())
                {
                    var cachedList = await _redisService.GetCache<List<FavouriteProductDTO>>(cacheKey);
                    if (cachedList != null)
                    {
                        cachedList.RemoveAll(x => x.CustomerId == UserIdentity.Id && x.ProductId == productId);
                        await _redisService.SetCache(cacheKey, cachedList, TimeSpan.FromDays(10));
                    }
                }

                // remove cookie
                var productFavouriteId = _cookieService.GetFavouriteProduct();
                if (productFavouriteId != null && productFavouriteId.Contains(productId))
                {
                    productFavouriteId.Remove(productId);
                    _cookieService.SaveFavouriteProduct(productFavouriteId);
                }
                return Ok(deleteRes);
            }
            return BadRequest(deleteRes);
        }
    }
}
