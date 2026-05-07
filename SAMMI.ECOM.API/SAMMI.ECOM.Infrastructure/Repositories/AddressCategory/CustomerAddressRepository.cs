using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.AddressCategory
{
    public interface ICustomerAddressRepository : ICrudRepository<CustomerAddress>
    {
        Task<CustomerAddressDTO> GetDefaultByUserId(int userId);
        Task<List<CustomerAddress>> GetByUserId(int userId);
        Task<bool> IsExisted(int id, int userId);
        Task<IEnumerable<CustomerAddress>> GetAll();
    }
    public class CustomerAddressRepository : CrudRepository<CustomerAddress>, ICustomerAddressRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        private readonly IMapper _mapper;
        public CustomerAddressRepository(
            SammiEcommerceContext context,
            IMapper mapper
            ) : base(context)
        {
            _context = context;
            _mapper = mapper;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<CustomerAddressDTO> GetDefaultByUserId(int userId)
        {
            var addressDefault = await DbSet.SingleOrDefaultAsync(x => x.CustomerId == userId && x.IsDefault == true && x.IsDeleted != true);
            if (addressDefault == null)
            {
                addressDefault = await DbSet.SingleOrDefaultAsync(x => x.CustomerId == userId && x.IsDeleted != true);
            }
            return _mapper.Map<CustomerAddressDTO>(addressDefault);
        }

        public async Task<ActionResponse> UpdateDefault(int userId)
        {
            var actRes = new ActionResponse();
            var addresses = DbSet.Where(x => x.CustomerId == userId && x.IsDeleted != true);
            foreach(var address in addresses)
            {
                address.IsDefault = false;
                actRes.Combine(Update(address));
                if(!actRes.IsSuccess)
                {
                    return actRes;
                }    
            }
            await SaveChangeAsync();
            return actRes;
        }

        public async Task<List<CustomerAddress>> GetByUserId(int userId)
        {
            return await DbSet.Where(x => x.CustomerId == userId && x.IsDeleted != true).ToListAsync();
        }

        public async Task<bool> IsExisted(int id, int userId)
        {
            return await DbSet.SingleOrDefaultAsync(x => x.Id == id && x.CustomerId == userId && x.IsDeleted != true) != null;
        }

        public async Task<IEnumerable<CustomerAddress>> GetAll()
        {
            return await DbSet.Where(x => x.IsDeleted != true).ToListAsync();
        }
    }
}
