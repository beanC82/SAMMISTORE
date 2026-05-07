using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.API.Services.ElasticSearch;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.API.Application.CommandHandlers.Products
{
    public class CUProductCategoryCommandHandler : CustombaseCommandHandler<CUProductCategoryCommand, ProductCategoryDTO>
    {
        private readonly IProductCategoryRepository _categoryRespository;
        private readonly IElasticService<ProductCategoryDTO> _elasticService;
        public CUProductCategoryCommandHandler(
            IProductCategoryRepository categoryRespository,
            IElasticService<ProductCategoryDTO> elasticService,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _categoryRespository = categoryRespository;
            _elasticService = elasticService;
        }

        public override async Task<ActionResponse<ProductCategoryDTO>> Handle(CUProductCategoryCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<ProductCategoryDTO>();
            if (await _categoryRespository.IsExistCode(request.Code, request.Id))
            {
                actResponse.AddError("Mã danh mục sản phẩm đã tồn tại");
                return actResponse;
            }
            if (await _categoryRespository.IsExistName(request.Name, request.Id))
            {
                actResponse.AddError("Tên danh mục sản phẩm đã tồn tại");
                return actResponse;
            }
            request.ParentId = request.ParentId == 0 ? null : request.ParentId;
            if (request.ParentId != null && !_categoryRespository.IsExisted(request.ParentId))
            {
                actResponse.AddError("Danh mục cha không tồn tại");
                return actResponse;
            }

            if (request.ParentId == request.Id)
            {
                actResponse.AddError("Danh mục cha không thể là chính nó");
                return actResponse;
            }


            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;

                var createResponse = await _categoryRespository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<ProductCategoryDTO>(createResponse.Result));
            }
            else
            {
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _categoryRespository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<ProductCategoryDTO>(updateRes.Result));
            }

            if (_elasticService != null && await _elasticService.IsConnected())
            {
                _elasticService.AddOrUpdate(IndexElasticEnum.Category.GetDescription(), actResponse.Result);
            }
            return actResponse;
        }
    }


    public class CUProductCategoryCommandValidator : AbstractValidator<CUProductCategoryCommand>
    {
        public CUProductCategoryCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã danh mục sản phẩm là bắt buộc");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên danh mục sản phẩm là bắt buộc");
        }
    }
}
