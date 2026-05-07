using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Products
{
    public interface IImageRepository : ICrudRepository<Image>
    {
        Task<List<ImageDTO>> GetDataByProductId(int productId);
        Task<List<ImageDTO>> GetDataByUserId(int userId);
        Task<Image> GetDataByUserIdAndImageId(int userId, int imageId);
        Task<ImageDTO> GetAvatarProduct(int productId);
    }

    public class ImageRepository : CrudRepository<Image>, IImageRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private readonly IMapper _mapper;
        private bool _disposed;
        public ImageRepository(SammiEcommerceContext context,
            IMapper mapper) : base(context)
        {
            _context = context;
            _mapper = mapper;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<List<ImageDTO>> GetDataByProductId(int productId)
        {
            var result = from img in _context.Images
                         join pi in _context.ProductImages on img.Id equals pi.ImageId
                         where pi.ProductId == productId
                         && img.IsDeleted != true
                         && pi.IsDeleted != true
                         select img;
            var images = await result.ToListAsync();
            return _mapper.Map<List<ImageDTO>>(images);
        }

        private int ConvertToUserId(string publicId)
        {
            if (publicId != null)
            {
                var parts = publicId.Split('/')[2];
                if(int.TryParse(parts.Split('_')[1], out var userIdEntry))
                {
                    return userIdEntry;
                }    
            }
            return 0;
        }

        public async Task<List<ImageDTO>> GetDataByUserId(int userId)
        {
            var images = await DbSet.Where(x => ConvertToUserId(x.PublicId) == userId && x.IsDeleted != true)
                .ToListAsync();
            return _mapper.Map<List<ImageDTO>>(images);
        }

        public Task<Image> GetDataByUserIdAndImageId(int userId, int imageId)
        {
            return DbSet.SingleOrDefaultAsync(x => x.Id == imageId && ConvertToUserId(x.PublicId) == userId && x.IsDeleted != true);
        }

        public async Task<ImageDTO> GetAvatarProduct(int productId)
        {
            var query = from i in DbSet
                        join pi in _context.ProductImages on i.Id equals pi.ImageId
                        where pi.ProductId == productId && i.IsDeleted != true && pi.IsDeleted != true
                        orderby pi.DisplayOrder descending
                        select i;
            return _mapper.Map<ImageDTO>(await query.FirstOrDefaultAsync());
        }
    }
}
