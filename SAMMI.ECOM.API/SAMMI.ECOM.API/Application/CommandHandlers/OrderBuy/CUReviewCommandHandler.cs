using AutoMapper;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.Products;

namespace SAMMI.ECOM.API.Application.CommandHandlers.OrderBuy
{
    public class CUReviewCommandHandler : CustombaseCommandHandler<CUReviewCommand, ReviewDTO>
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IMediator _mediator;
        private readonly IImageRepository _imageRepository;

        public CUReviewCommandHandler(
            IReviewRepository reviewRepository,
            IOrderRepository orderRepository,
            IProductRepository productRepository,
            IMediator mediator,
            IImageRepository imageRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _reviewRepository = reviewRepository;
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _mediator = mediator;
            _imageRepository = imageRepository;
        }

        public override async Task<ActionResponse<ReviewDTO>> Handle(CUReviewCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<ReviewDTO>();
            if (!await _orderRepository.IsExisted(request.OrderId, _currentUser.Id))
            {
                actResponse.AddError("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.");
                return actResponse;
            }

            var orderEntity = await _orderRepository.GetByIdAsync(request.OrderId);
            if (orderEntity.OrderStatus != OrderStatusEnum.Completed.ToString())
            {
                if (orderEntity.OrderStatus == OrderStatusEnum.Cancelled.ToString())
                {
                    actResponse.AddError("Đơn hàng này đã bị hủy nên không thể đánh giá sản phẩm.");
                    return actResponse;
                }
                else
                {
                    actResponse.AddError("Đơn hàng của bạn chưa được hoàn tất. Vui lòng chờ nhận hàng và xác nhận hoàn tất đơn hàng để có thể đánh giá sản phẩm.");
                    return actResponse;
                }
            }

            if (!_productRepository.IsExisted(request.ProductId))
            {
                actResponse.AddError("Sản phẩm không tồn tại.");
                return actResponse;
            }

            if (await _reviewRepository.IsExisted(request.OrderId, request.ProductId, _currentUser.Id))
            {
                actResponse.AddError("Sản phẩm đã được đánh giá.");
                return actResponse;
            }

            if (request.Id == 0)
            {
                request.ImageId = null;
                if (request.ImageCommand != null && !string.IsNullOrEmpty(request.ImageCommand.ImageBase64))
                {
                    request.ImageCommand.TypeImage = ImageEnum.Review.ToString();
                    request.ImageCommand.Value = "";
                    var imageResponse = await _mediator.Send(request.ImageCommand);
                    if (imageResponse.IsSuccess)
                    {
                        request.ImageId = imageResponse.Result.Id;
                    }
                    else
                    {
                        actResponse.AddError("Lỗi upload ảnh");
                        return actResponse;
                    }
                }

                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;

                var reviewEntity = _mapper.Map<Review>(request);
                reviewEntity.UserId = _currentUser.Id;
                var createResponse = await _reviewRepository.CreateAndSave(reviewEntity);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<ReviewDTO>(createResponse.Result));
            }
            else
            {
                ImageDTO imageDTO = null;
                var review = await _reviewRepository.GetByIdAsync(request.Id);
                if (review.ImageId != request.ImageId)
                {
                    actResponse.AddError("Không được thay đổi ImageId");
                    return actResponse;
                }
                if (request.ImageCommand != null && !string.IsNullOrEmpty(request.ImageCommand.ImageBase64))
                {
                    _imageRepository.DeleteAndSave(request.ImageId);
                    request.ImageCommand.TypeImage = ImageEnum.Review.ToString();
                    request.ImageCommand.Value = "";
                    request.ImageCommand.Id = 0;
                    var imageRes = await _mediator.Send(request.ImageCommand);
                    if (!imageRes.IsSuccess)
                    {
                        actResponse.AddError(imageRes.Message);
                        return actResponse;
                    }
                    imageDTO = imageRes.Result;
                }

                if (imageDTO != null)
                {
                    request.ImageId = imageDTO.Id;
                }
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _reviewRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<ReviewDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CUReviewCommandValidator : AbstractValidator<CUReviewCommand>
    {
        public CUReviewCommandValidator()
        {
            RuleFor(x => x.OrderId)
                .NotNull()
                .WithMessage("Mã đơn hàng không được bỏ trống");

            RuleFor(x => x.ProductId)
                .NotNull()
                .WithMessage("Mã sản phẩm không được bỏ trống");

            RuleFor(x => x.Rating)
                .NotNull()
                .WithMessage("Điểm đánh giá không được bỏ trống")
                .Must(x => x >= 1 && x <= 5)
                .WithMessage("Điểm đánh giá từ 1 đến 5");
        }
    }
}
