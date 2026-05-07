using Microsoft.AspNetCore.Authorization;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.API.Application
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public PermissionEnum PermissionCode { get; }
        public PermissionRequirement(PermissionEnum permission)
        {
            PermissionCode = permission;
        }
    }
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly UserIdentity _currentUser;

        public PermissionAuthorizationHandler(UserIdentity currentUser)
        {
            _currentUser = currentUser;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            var username = _currentUser.UserName;
            if (string.IsNullOrEmpty(username))
            {
                return Task.CompletedTask;
            }

            var permissions = _currentUser.Permissions;
            if (permissions.Contains(requirement.PermissionCode.ToPolicyName()))
            {
                context.Succeed(requirement);
            }
            return Task.CompletedTask;
        }
    }
}
