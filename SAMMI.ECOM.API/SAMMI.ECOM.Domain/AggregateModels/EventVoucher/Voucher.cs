using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

[Table("Voucher")]
public partial class Voucher : Entity
{
    [Column("Code")]
    [MaxLength(256)]
    public string Code { get; set; } = null!;

    [Column("Name")]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Column("EventId")]
    public int EventId { get; set; }

    [ForeignKey("DiscountType")]
    public int DiscountTypeId { get; set; }

    [Column("DiscountValue")]
    public decimal DiscountValue { get; set; }

    [Column("UsageLimit")]
    public int UsageLimit { get; set; }

    [Column("UsedCount")]
    public int UsedCount { get; set; }

    [Column("StartDate")]
    public DateTime StartDate { get; set; }

    [Column("EndDate")]
    public DateTime EndDate { get; set; }

    public virtual Event Event { get; set; }

    public virtual ICollection<MyVoucher> MyVouchers { get; set; } = new List<MyVoucher>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual DiscountType? DiscountType { get; set; }
    public virtual ICollection<VoucherCondition> VoucherConditions { get; set; } = new List<VoucherCondition>();
}