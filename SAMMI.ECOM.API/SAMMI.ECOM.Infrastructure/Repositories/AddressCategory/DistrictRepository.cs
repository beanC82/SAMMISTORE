using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.AddressCategory
{
    public interface IDistrictRepository : ICrudRepository<District>
    {
        Task<bool> CheckExistName(string name, int? id = 0);
        Task<bool> CheckExistCode(string code, int? id = 0);

    }
    public class DistrictRepository : CrudRepository<District>, IDistrictRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public DistrictRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CheckExistName(string name, int? id = 0)
        {
            return await _context.Districts.AnyAsync(x => x.Name.ToLower() == name.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public async Task<bool> CheckExistCode(string code, int? id = 0)
        {
            return await _context.Districts.AnyAsync(x => x.Code.ToLower() == code.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public void Dispose()
        {
            _disposed = true;
        }
    }
}
