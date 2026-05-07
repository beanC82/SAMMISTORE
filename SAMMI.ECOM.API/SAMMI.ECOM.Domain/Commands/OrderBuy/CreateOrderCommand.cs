using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;

namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class CreateOrderCommand : IRequest<ActionResponse<OrderDTO>>
    {
        public string Code { get; set; } = null!;
        public int CustomerId { get; set; }
        public string? OrderStatus { get; set; }
        public string? ShippingStatus { get; set; }
        public int? VoucherId { get; set; }
        public decimal? DiscountValue { get; set; }
        public int? WardId { get; set; }
        public string? CustomerAddress { get; set; }
        public decimal? CostShip { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public DateTime? ActualDeliveryDate { get; set; }
        public int? ShippingCompanyId { get; set; }
        public List<OrderDetailCommand> Details { get; set; }
        public int? PaymentMethodId { get; set; }
        public string? PlatForm { get; set; } = "Web";
        public bool IsBuyInStore { get; set; } = false;


        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }


    public class CreateOrderFromShopCommand : IRequest<ActionResponse<OrderDTO>>
    {
        public string Code { get; set; } = null!;
        public int CustomerId { get; set; }
        public string? OrderStatus { get; set; }
        public string? ShippingStatus { get; set; }
        public int? VoucherId { get; set; }
        public decimal? DiscountValue { get; set; }
        public List<OrderDetailCommand> Details { get; set; }
        public int? PaymentMethodId { get; set; }


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
