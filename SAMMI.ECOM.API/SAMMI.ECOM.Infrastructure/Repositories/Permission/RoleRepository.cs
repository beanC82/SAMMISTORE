using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Permission
{
    public interface IRoleRepository : ICrudRepository<Role>
    {
        Task<Role> FindByCode(string code);
        Task<int> GetIdByCode(string code);
        Task<bool> IsExistedCode(string code, int id);
    }
    public class RoleRepository : CrudRepository<Role>, IRoleRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public RoleRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<Role> FindByCode(string code)
        {
            return await DbSet.SingleOrDefaultAsync(x => x.Code.ToLower() == code.ToLower() && x.IsDeleted != true);
        }

        public Task<int> GetIdByCode(string code)
        {
            return DbSet.Where(x => x.Code.ToLower() == code.ToLower() && x.IsDeleted != true).Select(x => x.Id).FirstOrDefaultAsync();
        }

        public Task<bool> IsExistedCode(string code, int id)
        {
            return DbSet.AnyAsync(x => x.Code == code && x.IsDeleted != true);
        }
    }
}
