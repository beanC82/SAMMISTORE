using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.AddressCategory
{
    public interface IWardRepository : ICrudRepository<Ward>
    {
        Task<bool> CheckExistName(string name, int? id = 0);
        Task<bool> CheckExistCode(string code, int? id = 0);
        Task<WardDTO> GetById(int id);
    }
    public class WardRepository : CrudRepository<Ward>, IWardRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public WardRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CheckExistName(string name, int? id = 0)
        {
            return await _context.Wards.AnyAsync(x => x.Name.ToLower() == name.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public async Task<bool> CheckExistCode(string code, int? id = 0)
        {
            return await _context.Wards.AnyAsync(x => x.Code.ToLower() == code.ToLower() && x.Id != id && x.IsDeleted != true);
        }
        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<WardDTO> GetById(int id)
        {
            var query = from w in _context.Wards
                        join d in _context.Districts on w.DistrictId equals d.Id
                        join p in _context.Provinces on d.ProvinceId equals p.Id
                        where w.Id == id && w.IsDeleted != true
                        select new WardDTO
                        {
                            Id = w.Id,
                            Code = w.Code,
                            Name = w.Name,
                            DistrictId = w.DistrictId,
                            DistrictName = d.Name,
                            ProvinceId = p.Id,
                            ProvinceName = p.Name,
                            CreatedDate = w.CreatedDate,
                            UpdatedDate = w.UpdatedDate,
                            CreatedBy = w.CreatedBy,
                            UpdatedBy = w.UpdatedBy,
                            IsActive = w.IsActive,
                            IsDeleted = w.IsDeleted,
                        };
            return await query.FirstOrDefaultAsync();
        }
    }
}
