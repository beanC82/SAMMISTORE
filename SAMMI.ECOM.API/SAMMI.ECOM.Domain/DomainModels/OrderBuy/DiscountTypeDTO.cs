namespace SAMMI.ECOM.Domain.DomainModels.OrderBuy
{
    public class DiscountTypeDTO
    {
        public string Name { get; set; } = null!;

        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
