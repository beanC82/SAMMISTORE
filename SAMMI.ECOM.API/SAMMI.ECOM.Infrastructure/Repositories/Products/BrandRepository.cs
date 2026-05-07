using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Products
{
    public interface IBrandRepository : ICrudRepository<Brand>
    {
        Task<bool> IsExistCode(string code, int? id = 0);
        Task<bool> IsExistName(string name, int? id = 0);
        Task<ActionResponse> IsExistAnotherTbl(int id);
    }

    public class BrandRepository : CrudRepository<Brand>, IBrandRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        public BrandRepository(SammiEcommerceContext context) : base(context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<ActionResponse> IsExistAnotherTbl(int id)
        {
            var actionRes = new ActionResponse();
            bool result = await _context.Products.AnyAsync(x => x.BrandId == id && x.IsDeleted != true);
            if(result)
            {
                actionRes.AddError($"Không thể xóa thương hiệu có id {id} vì nó đang được sử dụng trong sản phẩm.");
            }
            return actionRes;
        }

        public async Task<bool> IsExistCode(string code, int? id = 0)
        {
            return await _context.Brands.AnyAsync(x => x.Code.ToLower() == code.ToLower() && x.Id != id && x.IsDeleted != true);
        }

        public async Task<bool> IsExistName(string name, int? id = 0)
        {
            return await _context.Brands.AnyAsync(x => x.Name.ToLower() == name.ToLower() && x.Id != id && x.IsDeleted != true);
        }
    }
}
