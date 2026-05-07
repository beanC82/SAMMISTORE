namespace SAMMI.ECOM.Domain.DomainModels.OrderBuy
{
    public class OrderDTO
    {
        public string Code { get; set; } = null!;
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PaymentStatus { get; set; }
        public int? PaymentMethodId { get; set; }
        public string? PaymentMethod { get; set; }
        public string? OrderStatus { get; set; }
        public string? ShippingStatus { get; set; }
        public int? VoucherId { get; set; }
        public int? WardId { get; set; }
        public string? CustomerAddress { get; set; }
        public decimal? CostShip { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public DateTime? ActualDeliveryDate { get; set; }
        public int? ShippingCompanyId { get; set; }
        public decimal? TotalPrice { get; set; }
        public int? TotalQuantity { get; set; }
        public string? ReturnUrl { get; set; }
        public List<OrderDetailDTO>? Details { get; set; }


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
