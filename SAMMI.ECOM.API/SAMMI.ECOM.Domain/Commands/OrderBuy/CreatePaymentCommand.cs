using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;

namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class CreatePaymentCommand : IRequest<ActionResponse<PaymentDTO>>
    {
        public int OrderId { get; set; }
        public string? OrderCode { get; set; }
        public string? UserIdentity { get; set; }
        public int? PaymentMethodId { get; set; }
        public decimal PaymentAmount { get; set; }
        public string? PaymentStatus { get; set; }
        public string? TransactionId { get; set; }
        public string? PlatForm { get; set; }

        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class CreatePayback
    {
        public string OrderCode { get; set; }
        public string? PlatForm { get; set; } = "Web";
    }
}
