using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

[Table("OrderDetail")]
public partial class OrderDetail : Entity
{
    [ForeignKey("Order")]
    public int OrderId { get; set; }

    [ForeignKey("Product")]
    public int ProductId { get; set; }

    [Column("Quantity")]
    public int Quantity { get; set; }
    [Column("Price")]
    public decimal Price { get; set; }

    [Column("Tax")]
    public decimal? Tax { get; set; }


    public virtual Order Order { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}