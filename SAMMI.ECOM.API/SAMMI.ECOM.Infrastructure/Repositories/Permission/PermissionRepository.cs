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
    public interface IPermissionRepository : ICrudRepository<SAMMI.ECOM.Domain.AggregateModels.System.Permission>
    {
        Task<List<Domain.AggregateModels.System.Permission>> GetAll();
    }
    public class PermissionRepository : CrudRepository<SAMMI.ECOM.Domain.AggregateModels.System.Permission>, IPermissionRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public PermissionRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public Task<List<Domain.AggregateModels.System.Permission>> GetAll()
        {
            return DbSet.ToListAsync();
        }
    }
}
