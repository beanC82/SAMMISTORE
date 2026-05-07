using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Models.RequestModels.QueryParams;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;

namespace SAMMI.ECOM.API.Controllers.OrderBuy
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : CustomBaseController
    {
        private readonly IReviewQueries _reviewQueries;
        private readonly IReviewRepository _reviewRepository;
        public ReviewsController(
            IReviewQueries reviewQueries,
            IReviewRepository reviewRepository,
            IMediator mediator,
            ILogger<ReviewsController> logger) : base(mediator, logger)
        {
            _reviewQueries = reviewQueries;
            _reviewRepository = reviewRepository;
        }

        [AllowAnonymous]
        [HttpGet("get-reviews-product")]
        public async Task<IActionResult> GetReviewsOfProductAsync([FromQuery] ReviewFilterModel request)
        {
            if (request.ProductId == null)
            {
                return BadRequest("Mã sản phẩm không được bỏ trống.");
            }
            return Ok(await _reviewQueries.GetList(request));
        }

        [AllowAnonymous]
        [HttpGet("get-overall-rating/{productId}")]
        public async Task<IActionResult> GetOverallRating(int productId)
        {
            return Ok(await _reviewQueries.GetTotalOverall(productId));
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetReviewAsync(int reviewId)
        {
            return Ok(await _reviewQueries.GetById(reviewId));
        }

        [AuthorizePermission(PermissionEnum.CustomerProductReview)]
        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] CUReviewCommand request)
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

        [AuthorizePermission(PermissionEnum.CustomerProductReview)]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsync(int id, [FromBody] CUReviewCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }
            if (!_reviewRepository.IsExisted(id))
            {
                return BadRequest("Đánh giá không tồn tại.");
            }
            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.CustomerProductReview)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            if (!await _reviewRepository.IsExisted(UserIdentity.Id, id))
            {
                return BadRequest("Đánh giá không tồn tại hoặc bạn không có quyền xóa đánh giá này.");
            }
            return Ok(_reviewRepository.DeleteAndSave(id));
        }
    }
}
