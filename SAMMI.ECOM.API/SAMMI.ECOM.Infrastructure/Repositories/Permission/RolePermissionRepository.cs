using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Permission
{
    public interface IRolePermissionRepository : ICrudRepository<RolePermission>
    {
        Task<RolePermission> GetByRolePermission(int roleId, int permissionId);
    }
    public class RolePermissionRepository : CrudRepository<RolePermission>, IRolePermissionRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public RolePermissionRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public Task<RolePermission> GetByRolePermission(int roleId, int permissionId)
        {
            return DbSet.SingleOrDefaultAsync(x => x.RoleId == roleId && x.PermissionId == permissionId);
        }
    }
}
