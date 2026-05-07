using AutoMapper;
using FluentValidation;
using SAMMI.ECOM.API.Services.SeriaLog;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Infrastructure.Repositories.System;

namespace SAMMI.ECOM.API.Application.CommandHandlers.OrderBuy
{
    public class CreatePurchaseOrderCommandHandler : CustombaseCommandHandler<CreatePurchaseOrderCommand, PurchaseOrderDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IPurchaseOrderRepository _purchaseRepository;
        private readonly IProductRepository _productRepository;
        private readonly IPurchaseOrderDetailRepository _purchaseDetailRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly INotificationRepository _notifiRepository;
        public CreatePurchaseOrderCommandHandler(
            IUsersRepository usersRepository,
            IPurchaseOrderRepository purchaseOrderRepository,
            IProductRepository productRepository,
            IPurchaseOrderDetailRepository purchaseDetailRepository,
            IRoleRepository roleRepository,
            INotificationRepository notificationRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _userRepository = usersRepository;
            _purchaseRepository = purchaseOrderRepository;
            _productRepository = productRepository;
            _purchaseDetailRepository = purchaseDetailRepository;
            _roleRepository = roleRepository;
            _notifiRepository = notificationRepository;
        }

        public override async Task<ActionResponse<PurchaseOrderDTO>> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
        {
            var actRes = new ActionResponse<PurchaseOrderDTO>();

            var role = await _roleRepository.GetByIdAsync(int.Parse(_currentUser.Roles.FirstOrDefault()));
            // nếu không là admin
            // nếu mà khác bản nháp hoặc chờ duyệt
            if ((role != null && role.Code != RoleTypeEnum.ADMIN.ToString()) && (request.Status != PurchaseOrderStatus.Draft && request.Status != PurchaseOrderStatus.PendingApproval))
            {
                actRes.AddError("Trạng thái đơn nhập không hợp lệ, trạng thái hợp lệ là bản nháp hoặc đang chờ duyệt");
                return actRes;
            }

            if (await _purchaseRepository.IsExistedCode(request.Code))
            {
                actRes.AddError("Mã đơn nhập hàng đã tồn tại.");
                return actRes;
            }

            if (!await _userRepository.IsExistedType(request.EmployeeId))
            {
                actRes.AddError("Mã nhân viên không tồn tại.");
                return actRes;
            }

            if (!await _userRepository.IsExistedType(request.SupplierId, TypeUserEnum.Supplier))
            {
                actRes.AddError("Mã nhà cung cấp không tồn tại.");
                return actRes;
            }

            foreach (var de in request.Details)
            {
                if (!_productRepository.IsExisted(de.ProductId))
                {
                    actRes.AddError("Sản phẩm không tồn tại");
                    return actRes;
                }
            }


            //request.Code = Guid.NewGuid().ToString();
            request.CreatedDate = DateTime.Now;
            request.CreatedBy = _currentUser.UserName;
            var createPurchaseRes = await _purchaseRepository.CreateAndSave(request);
            actRes.Combine(createPurchaseRes);
            if (!actRes.IsSuccess)
            {
                AppLogger.LogError(_currentUser,
                        PermissionEnum.ImportCreate.ToPolicyName(),
                        actRes.Message,
                        new Exception(),
                        new
                        {
                            request.Code
                        });
                return actRes;
            }
            var purchaseCreated = createPurchaseRes.Result;
            foreach (var detail in request.Details)
            {
                detail.PurchaseOrderId = purchaseCreated.Id;
                var createDetailRes = await _purchaseDetailRepository.CreateAndSave(detail);
                actRes.Combine(createDetailRes);
                if (!createPurchaseRes.IsSuccess)
                {
                    AppLogger.LogError(_currentUser,
                        PermissionEnum.ImportCreate.ToPolicyName(),
                        actRes.Message,
                        new Exception());
                    return actRes;
                }
            }

            AppLogger.LogAction(_currentUser,
                PermissionEnum.ImportCreate.ToPolicyName(),
                $"User {_currentUser.FullName} tạo phiếu nhập thành công!",
                new
                {
                    createPurchaseRes.Result.Code,
                    createPurchaseRes.Result.Status
                });

            //var notifiRes = await _notifiRepository.CreateNotifiForRole(RoleTypeEnum.ADMIN.ToString(),
            //    new Domain.AggregateModels.OrderBuy.Notification()
            //    {
            //        Title = request.Status == PurchaseOrderStatus.PendingApproval ? "Có đơn nhập hàng mới cần phê duyệt" : "Có đơn nhập hàng mới",
            //        Content = $"Có đơn nhập hàng mới mã {createPurchaseRes.Result.Code}",
            //        CreatedBy = _currentUser.UserName
            //    });
            //if (!notifiRes.IsSuccess)
            //{
            //    AppLogger.LogWarning(_currentUser,
            //        "NOTIFICATION",
            //        notifiRes.Message,
            //        new
            //        {
            //            createPurchaseRes.Result.Code,
            //            createPurchaseRes.Result.Status
            //        });
            //    actRes.AddError("Đã có lỗi xảy ra với phần thông báo của hệ thống!");
            //    return actRes;
            //}
            actRes.SetResult(_mapper.Map<PurchaseOrderDTO>(purchaseCreated));
            return actRes;
        }
    }

    public class CreatePurchaseOrderCommandValidator : AbstractValidator<CreatePurchaseOrderCommand>
    {
        public CreatePurchaseOrderCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã phiếu nhập không được bỏ trống");

            RuleFor(x => x.EmployeeId)
                .NotNull()
                .WithMessage("Nhân viên lập phiếu bắt buộc chọn");

            RuleFor(x => x.SupplierId)
                .NotNull()
                .WithMessage("Nhà cung cấp bắt buộc chọn");

            RuleFor(x => x.Details)
                .NotNull()
                .WithMessage("Danh sách sản phẩm không được bỏ trống")
                .Must(x => x.Count > 0)
                .WithMessage("Danh sách sản phẩm phải có ít nhất 1 sản phẩm")
                .Must(HaveUniqueProductId)
                .WithMessage("Danh sách sản phẩm chứa mã sản phẩm trùng lặp");

            RuleFor(x => x.Status)
                .NotNull()
                .WithMessage("Trạng thái đơn nhập không được bỏ trống")
                .IsInEnum()
                .WithMessage("Trạng thái không đúng định dạng");

            RuleForEach(x => x.Details)
                .SetValidator(new PurchaseOrderDetailCommandValidator());
        }

        private bool HaveUniqueProductId(List<PurchaseOrderDetailCommand> details)
        {
            var productIds = details.Select(x => x.ProductId).ToList();
            return productIds.Distinct().Count() == productIds.Count;
        }
    }

    public class PurchaseOrderDetailCommandValidator : AbstractValidator<PurchaseOrderDetailCommand>
    {
        public PurchaseOrderDetailCommandValidator()
        {
            RuleFor(x => x.ProductId)
                .NotNull()
                .WithMessage("Mã sản phẩm bắt buộc chọn");

            RuleFor(x => x.Quantity)
                .NotNull()
                .WithMessage("Số lượng không được bỏ trống")
                .GreaterThan(0)
                .WithMessage("Số lượng phải lớn hơn 0");

            RuleFor(x => x.UnitPrice)
                .NotNull()
                .WithMessage("Giá nhập không được bỏ trống")
                .GreaterThan(0)
                .WithMessage("Giá nhập phải lớn hơn 0");
        }
    }

    public class UpdatePurchaseOrderCommandHandler : CustombaseCommandHandler<UpdatePurchaseOrderCommand, PurchaseOrderDTO>
    {
        private readonly IUsersRepository _userRepository;
        private readonly IPurchaseOrderRepository _purchaseRepository;
        private readonly IProductRepository _productRepository;
        private readonly IPurchaseOrderDetailRepository _purchaseDetailRepository;
        private readonly IRoleRepository _roleRepository;
        public UpdatePurchaseOrderCommandHandler(
            IUsersRepository usersRepository,
            IPurchaseOrderRepository purchaseOrderRepository,
            IProductRepository productRepository,
            IPurchaseOrderDetailRepository purchaseDetailRepository,
            IRoleRepository roleRepository,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _userRepository = usersRepository;
            _purchaseRepository = purchaseOrderRepository;
            _productRepository = productRepository;
            _purchaseDetailRepository = purchaseDetailRepository;
            _roleRepository = roleRepository;
        }

        public override async Task<ActionResponse<PurchaseOrderDTO>> Handle(UpdatePurchaseOrderCommand request, CancellationToken cancellationToken)
        {
            var actRes = new ActionResponse<PurchaseOrderDTO>();
            if (!await _userRepository.IsExistedType(request.EmployeeId))
            {
                actRes.AddError("Mã nhân viên không tồn tại.");
                return actRes;
            }

            if (!await _userRepository.IsExistedType(request.SupplierId, TypeUserEnum.Supplier))
            {
                actRes.AddError("Mã nhà cung cấp không tồn tại.");
                return actRes;
            }

            foreach (var de in request.Details)
            {
                if (!_productRepository.IsExisted(de.ProductId))
                {
                    actRes.AddError("Sản phẩm không tồn tại");
                    return actRes;
                }
            }

            var existingDetails = await _purchaseDetailRepository.GetByPurchaseOrderId(request.Id);
            var existingDetailIds = existingDetails.Select(p => p.Id).ToHashSet();
            var invalidDetailIds = request.Details
                .Where(d => d.Id != 0 && !existingDetailIds.Contains(d.Id))
                .Select(d => d.Id)
                .ToList();

            if (invalidDetailIds.Any())
            {
                actRes.AddError($"Mã đơn chi tiết không tồn tại.");
                return actRes;
            }

            //if (request.Details.Any(d => existingDetails.Any(p => p.ProductId == d.ProductId && p.Id != d.Id)))
            //{
            //    actRes.AddError("Danh sách sản phẩm không được trùng lặp");
            //    return actRes;
            //}
            if (request.Details.Count < existingDetails.Count())
            {
                actRes.AddError($"Danh sách sản phẩm phải lớn hơn hoặc bằng {existingDetails.Count()}");
                return actRes;
            }

            request.UpdatedDate = DateTime.Now;
            request.UpdatedBy = _currentUser.UserName;
            var updatePurchaseRes = await _purchaseRepository.UpdateAndSave(request);
            actRes.Combine(updatePurchaseRes);
            if (!actRes.IsSuccess)
            {
                return actRes;
            }
            var purchaseUpdated = updatePurchaseRes.Result;
            var existingDetailDict = existingDetails.ToDictionary(d => d.ProductId);
            foreach (var detail in request.Details)
            {
                if (detail.Id != 0 && existingDetailDict.TryGetValue(detail.ProductId, out var existingDetail))
                {
                    if (existingDetail.ProductId != detail.ProductId)
                    {
                        actRes.AddError($"Mã chi tiết và mã sản phẩm không khớp");
                        return actRes;
                    }

                    existingDetail.Quantity = detail.Quantity;
                    existingDetail.UnitPrice = detail.UnitPrice;
                    existingDetail.UpdatedDate = DateTime.Now;
                    existingDetail.UpdatedBy = _currentUser?.UserName;
                    var updateDetailRes = _purchaseDetailRepository.Update(existingDetail);
                    actRes.Combine(updateDetailRes);
                }
                else if (detail.Id == 0)
                {
                    detail.PurchaseOrderId = purchaseUpdated.Id;
                    detail.CreatedDate = DateTime.Now;
                    detail.CreatedBy = _currentUser?.UserName;
                    var createDetailRes = _purchaseDetailRepository.Create(detail);
                    actRes.Combine(createDetailRes);
                }
                else
                {
                    actRes.AddError("Mã chi tiết đơn không tồn tại");
                    return actRes;
                }

                if (!actRes.IsSuccess)
                {
                    AppLogger.LogError(_currentUser,
                        PermissionEnum.ImportUpdate.ToPolicyName(),
                        actRes.Message,
                        new Exception(),
                        new
                        {
                            updatePurchaseRes.Result.Code
                        });
                    return actRes;
                }
            }

            await _purchaseDetailRepository.SaveChangeAsync();

            AppLogger.LogAction(_currentUser,
                PermissionEnum.ImportUpdate.ToPolicyName(),
                $"User {_currentUser.FullName} cập nhật thông tin phiếu nhập thành công!",
                new
                {
                    updatePurchaseRes.Result.Code,
                    updatePurchaseRes.Result.Status
                });

            actRes.SetResult(_mapper.Map<PurchaseOrderDTO>(purchaseUpdated));
            return actRes;
        }
    }

    public class UpdatePurchaseOrderCommandValidator : AbstractValidator<UpdatePurchaseOrderCommand>
    {
        public UpdatePurchaseOrderCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã phiếu nhập không được bỏ trống");

            RuleFor(x => x.EmployeeId)
                .NotNull()
                .WithMessage("Nhân viên lập phiếu bắt buộc chọn");

            RuleFor(x => x.SupplierId)
                .NotNull()
                .WithMessage("Nhà cung cấp bắt buộc chọn");

            //RuleFor(x => x.Details)
            //    .NotNull()
            //    .WithMessage("Danh sách sản phẩm không được bỏ trống")
            //    .Must(x => x.Count > 0)
            //    .WithMessage("Danh sách sản phẩm phải có ít nhất 1 sản phẩm")
            //    .Must(HaveUniqueProductId)
            //    .WithMessage("Danh sách sản phẩm chứa mã sản phẩm trùng lặp")
            //    .Must(HaveUnitqueDetailId)
            //    .WithMessage("Danh sách chi tiết đơn hàng chứa mã chi tiết trùng lặp");

            RuleForEach(x => x.Details)
                .SetValidator(new PurchaseOrderDetailCommandValidator());
        }

        private bool HaveUniqueProductId(List<PurchaseOrderDetailCommand> details)
        {
            var productIds = details.Select(x => x.ProductId).ToList();
            return productIds.Distinct().Count() == productIds.Count;
        }

        private bool HaveUnitqueDetailId(List<PurchaseOrderDetailCommand> details)
        {
            var detailIds = details.Select(x => x.Id).ToList();
            return detailIds.Distinct().Count() == detailIds.Count;
        }
    }
}
