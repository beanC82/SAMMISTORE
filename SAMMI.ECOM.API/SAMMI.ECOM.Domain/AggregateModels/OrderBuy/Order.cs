using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

[Table("Orders")]
public partial class Order : Entity
{
    [Column("Code")]
    [MaxLength(256)]
    public string Code { get; set; } = null!;

    [ForeignKey("Customer")]
    public int CustomerId { get; set; }

    [Column("OrderStatus")]
    [MaxLength(50)]
    public string? OrderStatus { get; set; }

    [Column("ShippingStatus")]
    [MaxLength(50)]
    public string? ShippingStatus { get; set; }

    [ForeignKey("Voucher")]
    public int? VoucherId { get; set; }
    [Column("DiscountValue")]
    public decimal? DiscountValue { get; set; }

    [ForeignKey("Ward")]
    public int? WardId { get; set; }

    [Column("CustomerAddress")]
    [MaxLength(255)]
    public string? CustomerAddress { get; set; }

    [Column("ShippingMethod")]
    [MaxLength(100)]
    public string? ShippingMethod { get; set; }

    [Column("CostShip")]
    public decimal? CostShip { get; set; }

    [Column("TrackingNumber")]
    [MaxLength(100)]
    public string? TrackingNumber { get; set; }

    [Column("EstimatedDeliveryDate")]
    public DateTime? EstimatedDeliveryDate { get; set; }

    [Column("ActualDeliveryDate")]
    public DateTime? ActualDeliveryDate { get; set; }

    [ForeignKey("ShippingCompany")]
    public int? ShippingCompanyId { get; set; }

    public virtual User Customer { get; set; } = null!;

    public virtual Voucher? Voucher { get; set; }

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Ward? Ward { get; set; }
    public virtual ShippingCompany? ShippingCompany { get; set; } = null!;

}
