using AutoMapper;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;

namespace SAMMI.ECOM.API.Infrastructure.AutoMapperConfigs
{
    public class OrderBuyMappingProfile : Profile
    {
        public OrderBuyMappingProfile()
        {
            CreateMap<CreateCartDetailCommand, CartDetail>();
            CreateMap<CartDetail, CartDetailDTO>();

            CreateMap<CreateOrderCommand, Order>();
            CreateMap<Order, OrderDTO>();

            CreateMap<OrderDetailCommand, OrderDetail>();

            CreateMap<CreatePaymentCommand, Payment>().ReverseMap();
            CreateMap<Payment, PaymentDTO>();

            CreateMap<CreatePurchaseOrderCommand, PurchaseOrder>();
            CreateMap<PurchaseOrder, PurchaseOrderDTO>();
            CreateMap<UpdatePurchaseOrderCommand, PurchaseOrder>();

            CreateMap<PurchaseOrderDetail, PurchaseOrderDetailDTO>();
            CreateMap<PurchaseOrderDetail, PurchaseOrderDetailCommand>().ReverseMap();


            // event
            CreateMap<UpdateEventCommand, Event>();
            CreateMap<CreateEventCommand, Event>();
            CreateMap<Event, EventDTO>();

            // voucher
            CreateMap<CUVoucherCommand, Voucher>();
            CreateMap<Voucher, VoucherDTO>();
            CreateMap<VoucherConditionCommand, VoucherCondition>();
            CreateMap<VoucherCondition, VoucherConditionDTO>();


            CreateMap<CUReviewCommand, Review>();
            CreateMap<Review, ReviewDTO>();
        }
    }
}
