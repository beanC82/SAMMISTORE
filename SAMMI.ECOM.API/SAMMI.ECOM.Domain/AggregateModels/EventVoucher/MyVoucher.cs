using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

[Table("MyVoucher")]
public partial class MyVoucher : Entity
{
    [ForeignKey("Customer")]
    public int CustomerId { get; set; }

    [ForeignKey("Voucher")]
    public int VoucherId { get; set; }

    [Column("IsUsed")]
    public bool IsUsed { get; set; }

    public virtual User Customer { get; set; } = null!;

    public virtual Voucher Voucher { get; set; } = null!;
}