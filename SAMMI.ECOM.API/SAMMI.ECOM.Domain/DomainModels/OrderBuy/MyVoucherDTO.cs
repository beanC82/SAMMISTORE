using Nest;

namespace SAMMI.ECOM.Domain.DomainModels.OrderBuy
{
    public class MyVoucherDTO
    {
        public int CustomerId { get; set; }
        public int VoucherId { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int DiscountTypeId { get; set; }
        public string? DiscountName { get; set; }
        public decimal DiscountValue { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsUsed { get; set; }
        public bool IsValid { get; set; }
        public List<VoucherConditionDTO>? Conditions { get; set; }

        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class RequestVoucherDTO
    {
        public List<CartDetailDTO> Details { get; set; }
    }
}
