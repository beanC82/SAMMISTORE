using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.API.Services.ElasticSearch;
using SAMMI.ECOM.API.Services.SeriaLog;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.Products;
using SAMMI.ECOM.Infrastructure.Repositories.Products;

namespace SAMMI.ECOM.API.Controllers.Products
{
    public class ProductsController : CustomBaseController
    {
        private readonly IProductQueries _productQueries;
        private readonly IProductRepository _productRepository;
        private readonly IProductElasticService _productElasticService;
        private readonly IProductCategoryRepository _categoryRepository;
        public ProductsController(
            IProductQueries productQueries,
            IProductRepository productRepository,
            IProductElasticService productElasticService,
            IProductCategoryRepository categoryRepository,
            UserIdentity userIdentity,
            IMediator mediator,
            ILogger<ProductsController> logger) : base(mediator, logger)
        {
            _productQueries = productQueries;
            _productRepository = productRepository;
            _productElasticService = productElasticService;
            _categoryRepository = categoryRepository;
            UserIdentity = userIdentity;
        }

        [AuthorizePermission(PermissionEnum.ProductView)]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.SimpleAll)
            {
                return Ok(await _productQueries.GetAll(request));
            }
            return Ok(await _productQueries.GetList(request));
        }

        [AuthorizePermission(PermissionEnum.ProductView)]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _productQueries.GetById(id));
        }

        [AuthorizePermission(PermissionEnum.ProductCreate)]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateProductCommand request)
        {
            if (request.Id != 0)
            {
                return BadRequest();
            }
            var response = await _mediator.Send(request);

            if (!response.IsSuccess)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [AuthorizePermission(PermissionEnum.ProductUpdate)]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] UpdateProductCommand request)
        {
            if ((id == 0 || request.Id == 0) || id != request.Id)
            {
                return BadRequest();
            }
            if (!_productRepository.IsExisted(id))
            {
                return BadRequest("Sản phẩm không tồn tại");
            }

            var response = await _mediator.Send(request);
            if (!response.IsSuccess)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [AuthorizePermission(PermissionEnum.ProductDelete)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var productEntity = await _productRepository.FindById(id);
            if (productEntity == null)
            {
                return BadRequest("Sản phẩm không tồn tại.");
            }
            var checkExistRes = await _productRepository.IsExistAnotherTable(id);
            if (!checkExistRes.IsSuccess)
            {
                return BadRequest(checkExistRes);
            }

            if (_productElasticService != null && await _productElasticService.IsConnected())
            {
                _productElasticService.DeleteProduct(id);
            }

            AppLogger.LogAction(UserIdentity,
                PermissionEnum.ProductDelete.ToPolicyName(),
                $"User {UserIdentity.FullName} xóa sản phẩm #{productEntity.Code} thành công!",
                new
                {
                    productEntity.Code
                });
            return Ok(_productRepository.DeleteAndSave(id));
        }

        [AuthorizePermission(PermissionEnum.ProductDelete)]
        [HttpDelete]
        public async Task<IActionResult> DeleteRange([FromBody] List<int> ids)
        {
            var actErrorResponse = new ActionResponse<List<string>>();
            var listError = new Dictionary<int, string>();
            if (ids == null || ids.Count == 0)
            {
                return BadRequest();
            }
            foreach (int id in ids)
            {
                if (!_productRepository.IsExisted(id))
                {
                    actErrorResponse.AddError($"Sản phẩm id {id} không tồn tại.");
                    return BadRequest(actErrorResponse);
                }
                var checkExistRes = await _productRepository.IsExistAnotherTable(id);
                if (!checkExistRes.IsSuccess)
                {
                    return BadRequest(checkExistRes);
                }
            }
            AppLogger.LogAction(UserIdentity,
                PermissionEnum.ProductDelete.ToPolicyName(),
                $"User {UserIdentity.FullName} xóa danh sách sản phẩm thành công!",
                new
                {
                    ids
                });
            _productElasticService.DeleteRangeProduct(ids);
            return Ok(_productRepository.DeleteRangeAndSave(ids.Cast<object>().ToArray()));
        }

        [HttpGet("get-code-by-last-id")]
        public async Task<IActionResult> GetCodeByLastId()
        {
            return Ok(await _productQueries.GetCodeByLastId());
        }

        [AllowAnonymous]
        [HttpGet("get-suggest")]
        public async Task<IActionResult> GetDataSuggest([FromQuery] string keyWord, [FromQuery] int size = 5)
        {
            //var product = (await _productQueries.GetAll()).Where(x => x.Name.Contains(keyWord))
            //    .Select(x => new SuggestProductDTO
            //    {
            //        Id = x.Id,
            //        Name = x.Name,
            //        Code = x.Code,
            //        ProductImage = x.Images.FirstOrDefault()?.ImageUrl,
            //        Price = x.Price
            //    }).ToList();

            //return Ok(product);
            return Ok(await _productElasticService.SuggestProducts(keyWord, size));
        }

        [AllowAnonymous]
        [HttpGet("get-related-products")]
        public async Task<IActionResult> GetRelatedProductsAsync(int productId, int numberTop = 5)
        {
            return Ok(await _productQueries.GetRelated(productId, numberTop));
        }

        [AuthorizePermission(PermissionEnum.ProductCreate)]
        [HttpPost("push-product-elastic")]
        public async Task<IActionResult> PushProductInElasticAsync()
        {
            await _productElasticService.BulkImportProducts();
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("get-product-new")]
        public async Task<IActionResult> GetProductNewAsync([FromQuery] int numberTop = 20)
        {
            return Ok(await _productQueries.GetDataNew(numberTop));
        }

        [AllowAnonymous]
        [HttpGet("get-product-best-selling")]
        public async Task<IActionResult> GetProductBestSellingAsync([FromQuery] int numberTop = 40)
        {
            return Ok(await _productQueries.GetListBetSellingProduct(numberTop));
        }

        [AllowAnonymous]
        [HttpGet("get-product-by-category")]
        public async Task<IActionResult> GetProductByCategoryAsync(int categoryId, int numberTop = 20)
        {
            if (!_categoryRepository.IsExisted(categoryId))
            {
                return BadRequest("Loại sản phẩm không tồn tại");
            }
            return Ok(await _productQueries.GetListByCategory(categoryId, numberTop));
        }

        [AllowAnonymous]
        [HttpGet("get-product/{id}")]
        public async Task<IActionResult> GetProdutById(int id)
        {
            return Ok(await _productQueries.GetByIdV2(id));
        }

        [AllowAnonymous]
        [HttpGet("get-products-endow")]
        public async Task<IActionResult> GetProductEndowAsync(int numberTop = 30)
        {
            return Ok(await _productQueries.GetDataInVoucherCondition(numberTop));
        }
    }
}
