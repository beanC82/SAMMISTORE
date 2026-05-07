using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

[Table("CartDetail")]
public partial class CartDetail : Entity
{
    [ForeignKey("Cart")]
    public int CartId { get; set; }

    [ForeignKey("Product")]
    public int ProductId { get; set; }

    [Column("Quantity")]
    public int Quantity { get; set; }

    public virtual Cart Cart { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}