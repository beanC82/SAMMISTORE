using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

[Table("Cart")]
public partial class Cart : Entity
{
    [ForeignKey("Customer")]
    public int CustomerId { get; set; }

    public virtual User Customer { get; set; } = null!;

    public virtual ICollection<CartDetail> CartDetails { get; set; } = new List<CartDetail>();
}
