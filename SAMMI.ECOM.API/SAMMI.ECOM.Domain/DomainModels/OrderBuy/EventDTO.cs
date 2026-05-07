namespace SAMMI.ECOM.Domain.DomainModels.OrderBuy
{
    public class EventDTO
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? EventType { get; set; }
        public int? ImageId { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public List<VoucherDTO>? Vouchers { get; set; }


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
