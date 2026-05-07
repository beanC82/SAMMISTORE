namespace SAMMI.ECOM.Domain.DomainModels.OrderBuy
{
    public class VoucherConditionDTO
    {
        public int VoucherId { get; set; }
        public string ConditionType { get; set; }
        public string ConditionValue { get; set; }

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
