using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

[Table("DiscountType")]
public partial class DiscountType : Entity
{
    [Column("Code")]
    [MaxLength(100)]
    public string Code { get; set; } = null!;

    [Column("Name")]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Column("Description")]
    [MaxLength(500)]
    public string? Description { get; set; }

    public virtual ICollection<Voucher> Vouchers { get; set; } = new List<Voucher>();
}
