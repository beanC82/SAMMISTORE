using SAMMI.ECOM.Domain.Seeds;

namespace SAMMI.ECOM.Domain.DomainModels.Products
{
    public class BrandDTO : EntityDTO
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int? ImageId { get; set; }
        public string? ImageUrl { get; set; }
    }
}
