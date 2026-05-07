using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.System;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries;
using SAMMI.ECOM.Infrastructure.Queries.System;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;

namespace SAMMI.ECOM.API.Controllers.System
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : CustomBaseController
    {
        private readonly IRoleQueries _roleQueries;
        private readonly IRoleRepository _roleRepository;
        private readonly IPermissionQueries _permissionQueries;
        private readonly IUsersQueries _usersQueries;
        public RolesController(
            IRoleQueries roleQueries,
            IRoleRepository roleRepository,
            IPermissionQueries permissionQueries,
            IUsersQueries usersQueries,
            IMediator mediator,
            ILogger<RolesController> logger) : base(mediator, logger)
        {
            _roleQueries = roleQueries;
            _roleRepository = roleRepository;
            _permissionQueries = permissionQueries;
            _usersQueries = usersQueries;
        }

        [AuthorizePermission(PermissionEnum.RoleView)]
        [HttpGet]
        public async Task<IActionResult> GetAsync([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.Grid)
            {
                return Ok(await _roleQueries.GetList(request));
            }
            else if (request.Type == RequestType.Selection)
            {
                return Ok(await _roleQueries.GetSelectionList(request));
            }
            return Ok();
        }

        [AuthorizePermission(PermissionEnum.RoleCreate)]
        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] CURoleCommand request)
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

        [AuthorizePermission(PermissionEnum.RoleUpdate)]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsync(int id, [FromBody] CURoleCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }
            if (!_roleRepository.IsExisted(id))
            {
                return BadRequest("Vai trò không tồn tại.");
            }
            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.RoleDelete)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var roleEntity = await _roleRepository.GetByIdAsync(id);
            if (roleEntity == null)
            {
                return BadRequest("Vai trò không tồn tại");
            }
            if (roleEntity.IsLock == true)
            {
                return BadRequest("Vai trò này đã khóa");
            }
            return Ok(_roleRepository.DeleteAndSave(id));
        }

        [AuthorizePermission(PermissionEnum.RoleAssignPermission)]
        [HttpGet("get-permissions")]
        public async Task<IActionResult> GetPermissionsAsync([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.Grid)
            {
                return Ok(await _permissionQueries.GetList(request));
            }
            return Ok(await _permissionQueries.GetAll());
        }

        [AuthorizePermission(PermissionEnum.RoleAssignPermission)]
        [HttpGet("get-role-permission/{roleId}")]
        public async Task<IActionResult> GetRolePermissionAsync(int roleId)
        {
            if (!_roleRepository.IsExisted(roleId))
            {
                return BadRequest("Vai trò không tồn tại");
            }
            return Ok(await _permissionQueries.GetPermissionOfRole(roleId));
        }

        [AuthorizePermission(PermissionEnum.RoleAssignPermission)]
        [HttpPost("assign-permission")]
        public async Task<IActionResult> AssignPermissionAsync([FromBody] CURolePermissionCommand request)
        {
            var res = await _mediator.Send(request);
            if (res.IsSuccess)
                return Ok(res);
            return BadRequest(res);
        }
    }
}
