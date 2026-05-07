using AutoMapper;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.System;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;

namespace SAMMI.ECOM.API.Application.CommandHandlers.System
{
    public class CURolePermissionCommandHandler : CustombaseCommandHandler<CURolePermissionCommand, RolePermissionDTO>
    {
        private readonly IRolePermissionRepository _rolePermissionRepository;
        private readonly IMediator _mediator;
        private readonly IRoleRepository _roleRepository;
        private readonly IPermissionRepository _permissionRepository;

        public CURolePermissionCommandHandler(
            IRolePermissionRepository rolePermissionRepository,
            IMediator mediator,
            IRoleRepository roleRepository,
            IPermissionRepository permissionRepository,
            UserIdentity currentUser, IMapper mapper) : base(currentUser, mapper)
        {
            _rolePermissionRepository = rolePermissionRepository;
            _mediator = mediator;
            _roleRepository = roleRepository;
            _permissionRepository = permissionRepository;
        }

        public override async Task<ActionResponse<RolePermissionDTO>> Handle(CURolePermissionCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<RolePermissionDTO>();

            var roleEntity = await _roleRepository.GetByIdAsync(request.RoleId);
            if (roleEntity == null)
            {
                actResponse.AddError("Vai trò không tồn tại");
                return actResponse;
            }
            if (roleEntity.IsLock == true)
            {
                actResponse.AddError("Vai trò này đã khóa không thể phân quyền");
                return actResponse;
            }

            var permissionEntity = await _permissionRepository.GetByIdAsync(request.PermissionId);
            if (permissionEntity == null || permissionEntity.IsShow != true)
            {
                actResponse.AddError("Quyền không tồn tại");
                return actResponse;
            }

            var rolePermission = await _rolePermissionRepository.GetByRolePermission(request.RoleId, request.PermissionId);
            if (rolePermission == null)
            {
                request.CreatedBy = _currentUser.UserName;
                request.CreatedDate = DateTime.Now;
                var createResponse = await _rolePermissionRepository.CreateAndSave(request);
                actResponse.Combine(createResponse);
                actResponse.SetResult(_mapper.Map<RolePermissionDTO>(createResponse.Result));
            }
            else
            {
                rolePermission.Allow = request.Allow;
                rolePermission.UpdatedBy = _currentUser.UserName;
                rolePermission.UpdatedDate = DateTime.Now;

                var updateRes = await _rolePermissionRepository.UpdateAndSave(request);
                actResponse.Combine(updateRes);
                actResponse.SetResult(_mapper.Map<RolePermissionDTO>(updateRes.Result));
            }

            return actResponse;
        }
    }

    public class CURolePermissionCommandValidator : AbstractValidator<CURolePermissionCommand>
    {
        public CURolePermissionCommandValidator()
        {
            RuleFor(x => x.RoleId)
                .NotNull()
                .WithMessage("Vai trò bắt buộc chọn");

            RuleFor(x => x.PermissionId)
                .NotNull()
                .WithMessage("Quyền bắt buộc chọn");
        }
    }
}
