using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;


[Table("PaymentMethod")]
public partial class PaymentMethod : Entity
{
    [Column("Code")]
    public string Code { get; set; }

    [Column("Name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}