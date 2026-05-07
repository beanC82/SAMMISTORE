using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.AddressCategory
{
    public interface IProvinceRepository : ICrudRepository<Province>
    {
        Task<bool> CheckExistPosttalCode(string code, int? id = 0);
        Task<bool> CheckExistCode(string code, int? id = 0);
        Task<bool> CheckExistName(string name, int? id = 0);
    }
    public class ProvinceRepository : CrudRepository<Province>, IProvinceRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public ProvinceRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CheckExistPosttalCode(string code, int? id = 0)
        {
            return await _context.Provinces.AnyAsync(x => x.PostalCode.ToLower() == code.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public async Task<bool> CheckExistName(string name, int? id = 0)
        {
            return await _context.Provinces.AnyAsync(x => x.Name.ToLower() == name.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<bool> CheckExistCode(string code, int? id = 0)
        {
            return await _context.Provinces.AnyAsync(x => x.Code.ToLower() == code.ToLower() && x.Id != id && x.IsDeleted != true);
        }
    }
}
