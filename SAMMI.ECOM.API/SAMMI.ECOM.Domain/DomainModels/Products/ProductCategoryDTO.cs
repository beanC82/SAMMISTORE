namespace SAMMI.ECOM.Domain.DomainModels.Products
{
    public class ProductCategoryDTO : EntityDTO
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public int Level { get; set; }
    }
}
