using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class UpdatePurchaseOrderCommand : IRequest<ActionResponse<PurchaseOrderDTO>>
    {
        public string? Code { get; set; }
        public int EmployeeId { get; set; }
        public int SupplierId { get; set; }
        public string? Note { get; set; }
        public List<PurchaseOrderDetailCommand> Details { get; set; }

        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; }
    }

    public class CreatePurchaseOrderCommand : UpdatePurchaseOrderCommand
    {
        public PurchaseOrderStatus Status { get; set; }
    }

    public class UpdatePurchaseStatusCommand
    {
        public int PurchaseOrderId { get; set; }
        public PurchaseOrderStatus NewStatus { get; set; }
    }

    public class UpdatePurchasesStatusCommand
    {
        public List<int> PurchaseOrderIds { get; set; }
        public PurchaseOrderStatus NewStatus { get; set; }
    }

    public class PurchaseOrderDetailCommand
    {
        public int PurchaseOrderId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal? Tax { get; set; }

        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
