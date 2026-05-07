using AutoMapper;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Commands.System;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;

namespace SAMMI.ECOM.API.Application.CommandHandlers.System
{
    public class CURoleCommandHandler : CustombaseCommandHandler<CURoleCommand, RoleDTO>
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IMediator _mediator;
        private readonly IPermissionRepository _permissionRepository;
        private readonly IRolePermissionRepository _rolePermissionRepository;

        public CURoleCommandHandler(
            IRoleRepository roleRepository,
            IMediator mediator,
            IPermissionRepository permissionRepository,
            IRolePermissionRepository rolePermissionRepository,
            UserIdentity currentUser, IMapper mapper) : base(currentUser, mapper)
        {
            _roleRepository = roleRepository;
            _mediator = mediator;
            _permissionRepository = permissionRepository;
            _rolePermissionRepository = rolePermissionRepository;
        }

        public override async Task<ActionResponse<RoleDTO>> Handle(CURoleCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<RoleDTO>();
            if (await _roleRepository.IsExistedCode(request.Code, request.Id))
            {
                actResponse.AddError("Mã vai trò đã tồn tại.");
                return actResponse;
            }

            if (request.Id == 0)
            {
                request.CreatedDate = DateTime.Now;
                request.CreatedBy = _currentUser.UserName;
                var createResponse = await _roleRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                if (!actResponse.IsSuccess)
                    return actResponse;

                var permissions = await _permissionRepository.GetAll();
                var rolePermissions = new List<RolePermission>();
                rolePermissions.AddRange(
                            permissions
                            .Where(p => PermissionCodes.PERMISSION_ADMIN_CODES.Select(x => x.ToPolicyName()).Contains(p.Code))
                            .Select(per => new RolePermission()
                            {
                                RoleId = createResponse.Result.Id,
                                PermissionId = per.Id,
                                Allow = true,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                CreatedBy = _currentUser.UserName
                            })
                        );
                foreach (var rp in rolePermissions)
                {
                    actResponse.Combine(_rolePermissionRepository.Create(rp));
                    if (!actResponse.IsSuccess)
                    {
                        return actResponse;
                    }
                }

                await _rolePermissionRepository.SaveChangeAsync();
                actResponse.SetResult(_mapper.Map<RoleDTO>(createResponse.Result));
            }
            else
            {
                var roleEntity = await _roleRepository.FindById(request.Id);
                if (roleEntity != null && roleEntity.IsLock == true)
                {
                    actResponse.AddError("Quyền này đã khóa, vui lòng liên hệ với bên phát triển");
                    return actResponse;
                }
                request.UpdatedDate = DateTime.Now;
                request.UpdatedBy = _currentUser.UserName;

                var updateRes = await _roleRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<RoleDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CURoleCommandValidator : AbstractValidator<CURoleCommand>
    {
        public CURoleCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã vai trò không được bỏ trống");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên vai trò không được bỏ trống");
        }
    }
}
