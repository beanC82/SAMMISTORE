namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class CUPaymentCommand
    {
        public int OrderId { get; set; }
        public int PaymentMethodId { get; set; }
        public decimal PaymentAmount { get; set; }
        public string? PaymentStatus { get; set; }
        public string? TransactionId { get; set; }

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
