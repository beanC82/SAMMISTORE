using Microsoft.AspNetCore.Authorization;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.API.Application
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class AuthorizePermissionAttribute : AuthorizeAttribute
    {
        public AuthorizePermissionAttribute(PermissionEnum permission)
        {
            Policy = permission.ToPolicyName();
        }
    }
}
