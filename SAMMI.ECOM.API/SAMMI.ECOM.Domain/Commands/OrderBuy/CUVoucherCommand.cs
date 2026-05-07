using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;

namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class CUVoucherCommand : IRequest<ActionResponse<VoucherDTO>>
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int EventId { get; set; }
        public int DiscountTypeId { get; set; }
        public decimal DiscountValue { get; set; }
        public int UsageLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<VoucherConditionCommand>? Conditions { get; set; }

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
