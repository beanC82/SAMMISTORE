using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.Products;

namespace SAMMI.ECOM.API.Application.CommandHandlers.OrderBuy
{
    public class CUVoucherCommandHandler : CustombaseCommandHandler<CUVoucherCommand, VoucherDTO>
    {
        private readonly IVoucherRepository _voucherRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IDiscountTypeRepository _typeRepository;
        private readonly IVoucherConditionRepository _conditionRepository;
        private readonly IProductRepository _productRepository;
        private readonly IProvinceRepository _provinceRepository;
        private readonly Dictionary<DiscountTypeEnum, List<ConditionTypeEnum>> validConditions = new Dictionary<DiscountTypeEnum, List<ConditionTypeEnum>>()
        {
            // Giảm giá theo phần trăm
            { DiscountTypeEnum.Percentage, new List<ConditionTypeEnum>
                {
                    ConditionTypeEnum.MinOrderValue,
                    ConditionTypeEnum.MaxDiscountAmount,
                    ConditionTypeEnum.RequiredProducts, // Thêm RequiredProducts
                    ConditionTypeEnum.RequiredQuantity
                }
            },

            // Giảm giá số tiền cố định
            { DiscountTypeEnum.FixedAmount, new List<ConditionTypeEnum>
                {
                    ConditionTypeEnum.MinOrderValue,
                    ConditionTypeEnum.RequiredProducts, // Thêm RequiredProducts
                    ConditionTypeEnum.RequiredQuantity
                }
            },

            // Miễn phí vận chuyển
            { DiscountTypeEnum.FreeShipping, new List<ConditionTypeEnum>
                {
                    ConditionTypeEnum.MinOrderValue,
                    ConditionTypeEnum.AllowedRegions,
                    ConditionTypeEnum.RequiredQuantity,
                }
            }
        };
        public CUVoucherCommandHandler(
            IVoucherRepository voucherRepository,
            IEventRepository eventRepository,
            IDiscountTypeRepository discountTypeRepository,
            IVoucherConditionRepository voucherConditionRepository,
            IProductRepository productRepository,
            IProvinceRepository provinceRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _voucherRepository = voucherRepository;
            _eventRepository = eventRepository;
            _typeRepository = discountTypeRepository;
            _conditionRepository = voucherConditionRepository;
            _productRepository = productRepository;
            _provinceRepository = provinceRepository;
        }

        public override async Task<ActionResponse<VoucherDTO>> Handle(CUVoucherCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<VoucherDTO>();

            #region validate
            if (await _voucherRepository.CheckExistCode(request.Code, request.Id))
            {
                actResponse.AddError("Mã phiếu giảm giá đã tồn tại");
                return actResponse;
            }

            var eventEntity = await _eventRepository.FindById(request.EventId);
            if (eventEntity == null)
            {
                actResponse.AddError("Chương trình khuyến mãi không tồn tại");
                return actResponse;
            }
            if (!(request.StartDate >= eventEntity.StartDate
                  && request.StartDate < eventEntity.EndDate
                  && request.EndDate > eventEntity.StartDate
                  && request.EndDate <= eventEntity.EndDate))
            {
                actResponse.AddError("Thời gian áp dụng của voucher không hợp lệ với chương trình khuyến mãi này");
                return actResponse;
            }

            if (!_typeRepository.IsExisted(request.DiscountTypeId))
            {
                actResponse.AddError("Loại phiếu giảm giá không tồn tại");
                return actResponse;
            }

            var discountType = await _typeRepository.FindById(request.DiscountTypeId);
            if (!Enum.TryParse<DiscountTypeEnum>(discountType.Code, out var discountTypeEnum))
            {
                actResponse.AddError("Loại voucher không hợp lệ.");
                return actResponse;
            }
            if (!validConditions.TryGetValue(discountTypeEnum, out var allowedConditions))
            {
                actResponse.AddError("Loại voucher không hợp lệ.");
                return actResponse;
            }

            foreach (var condition in request.Conditions)
            {
                if (!allowedConditions.Contains(condition.ConditionType))
                {
                    actResponse.AddError($"Điều kiện {condition.ConditionType} không hợp lệ với loại voucher {discountTypeEnum.ToString()}.");
                    return actResponse;
                }
            }

            if (request.Conditions != null && request.Conditions.Any())
            {
                foreach (var c in request.Conditions)
                {
                    if (c.ConditionType == ConditionTypeEnum.RequiredProducts ||
                        c.ConditionType == ConditionTypeEnum.AllowedRegions)
                    {
                        var values = c.ConditionValue.ToString().Split(",");
                        if (c.ConditionType == ConditionTypeEnum.RequiredProducts)
                        {
                            foreach (var v in values)
                            {
                                if (!await _productRepository.IsExistCode(v))
                                {
                                    actResponse.AddError("Một số mã sản phẩm trong điều kiện giảm giá không tồn tại");
                                    return actResponse;
                                }
                            }
                        }
                        else if (c.ConditionType == ConditionTypeEnum.AllowedRegions)
                        {
                            foreach (var v in values)
                            {
                                if (!await _provinceRepository.CheckExistCode(v))
                                {
                                    actResponse.AddError("Một số mã tỉnh/thành trong điều kiện giảm giá không tồn tại");
                                    return actResponse;
                                }
                            }
                        }
                    }

                }
            }

            #endregion
            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                var createResponse = await _voucherRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                if (!actResponse.IsSuccess)
                {
                    return actResponse;
                }
                var voucher = createResponse.Result;

                //add condition
                foreach (var c in request.Conditions)
                {
                    c.VoucherId = voucher.Id;
                    c.CreatedDate = DateTime.Now;
                    c.CreatedBy = _currentUser.UserName;
                    actResponse.Combine(_conditionRepository.Create(c));
                    if (!actResponse.IsSuccess)
                    {
                        return actResponse;
                    }
                }
                await _conditionRepository.SaveChangeAsync();

                actResponse.SetResult(_mapper.Map<VoucherDTO>(createResponse.Result));
            }
            else
            {
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var existingConditions = await _conditionRepository.GetByVoucherId(request.Id);
                if (request.Conditions.Any(con => existingConditions.Any(c => c.ConditionType == con.ConditionType.ToString())))
                {
                    actResponse.AddError("Một hoặc nhiều điều kiện đã tồn tại trong phiếu giảm giá.");
                    return actResponse;
                }
                if (request.Conditions.Count < existingConditions.Count())
                {
                    actResponse.AddError($"Số lượng điều kiện của phiếu giảm giá phải lớn hơn hoặc bằng {existingConditions.Count()}.");
                    return actResponse;
                }

                var updateRes = await _voucherRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                if (!actResponse.IsSuccess)
                {
                    return actResponse;
                }

                var existingConditionDict = existingConditions.ToDictionary(c => c.Id);

                foreach (var condition in request.Conditions)
                {
                    condition.VoucherId = request.Id;
                    if (existingConditionDict.TryGetValue(condition.Id, out var existingCondition))
                    {
                        existingCondition = _mapper.Map(condition, existingCondition);
                        existingCondition.UpdatedDate = DateTime.Now;
                        existingCondition.UpdatedBy = _currentUser.UserName;
                        actResponse.Combine(_conditionRepository.Update(existingCondition));
                    }
                    else
                    {
                        condition.CreatedDate = DateTime.Now;
                        condition.CreatedBy = _currentUser.UserName;
                        actResponse.Combine(_conditionRepository.Create(condition));
                    }

                    if (!actResponse.IsSuccess)
                    {
                        return actResponse;
                    }
                }

                await _conditionRepository.SaveChangeAsync();
                actResponse.SetResult(_mapper.Map<VoucherDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CUVoucherCommandValidator : AbstractValidator<CUVoucherCommand>
    {
        public CUVoucherCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã phiếu giảm giá không được bỏ trống");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên phiếu giảm giá không được bỏ trống");

            RuleFor(x => x.EventId)
                .NotNull()
                .Must(x => x > 0)
                .WithMessage("Chương trình khuyến mãi bắt buộc chọn");

            RuleFor(x => x.StartDate)
                .NotEmpty()
                .WithMessage("Ngày bắt đầu không được bỏ trống")
                .Must(x => x > DateTime.Now)
                .WithMessage("Ngày bắt đầu phải lớn hơn ngày hiện tại");

            RuleFor(x => x.EndDate)
                .NotEmpty()
                .WithMessage("Ngày kết thúc không được bỏ trống")
                .Must(x => x > DateTime.Now)
                .WithMessage("Ngày kết thúc phải lớn hơn ngày hiện tại")
                .GreaterThan(x => x.StartDate)
                .WithMessage("Ngày kết thúc phải lớn hơn ngày bắt đầu");

            RuleFor(x => x.UsageLimit)
                .Must(x => x >= 1)
                .WithMessage("Số lượng sử dụng phải lớn hơn 0");

            RuleFor(x => x.DiscountTypeId)
                .NotEmpty()
                .WithMessage("Loại phiếu giảm giá bắt buộc chọn");

            RuleForEach(x => x.Conditions)
                .SetValidator(new VoucherConditionCommandValidator())
                .When(x => x.Conditions != null && x.Conditions.Any());

            RuleFor(x => x.Conditions)
                .Must(cons =>
                {
                    if (cons == null || !cons.Any())
                    {
                        return true;
                    }
                    var conditionTypes = cons.Select(c => c.ConditionType).ToList();
                    return conditionTypes.Distinct().Count() == cons.Count();
                })
                .WithMessage("Danh sách điều kiện không được chứa các loại điều kiện trùng lặp.");
        }
    }

    public class VoucherConditionCommandValidator : AbstractValidator<VoucherConditionCommand>
    {
        public VoucherConditionCommandValidator()
        {
            RuleFor(x => x.ConditionValue)
                .Must((command, value) =>
                {
                    // Chỉ validate nếu ConditionType là MinOrderValue, MaxDiscountAmount, hoặc RequiredQuantity
                    if (command.ConditionType == ConditionTypeEnum.MinOrderValue ||
                        command.ConditionType == ConditionTypeEnum.MaxDiscountAmount ||
                        command.ConditionType == ConditionTypeEnum.RequiredQuantity)
                    {
                        return decimal.TryParse(value?.ToString(), out _); // Kiểm tra giá trị có phải là số hay không
                    }
                    return true;
                })
                .WithMessage("Giá trị của điều kiện giảm giá MinOrderValue, MaxDiscountAmount, RequiredQuantity phải là số.");
        }
    }
}
