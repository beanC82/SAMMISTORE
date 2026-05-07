using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
[Table("PurchaseOrderDetail")]
public partial class PurchaseOrderDetail : Entity
{
    [ForeignKey("PurchaseOrder")]
    public int PurchaseOrderId { get; set; }

    [ForeignKey("Product")]
    public int ProductId { get; set; }

    [Column("Quantity")]
    public int Quantity { get; set; }

    [Column("UnitPrice")]
    public decimal? UnitPrice { get; set; }

    [Column("Tax")]
    public decimal? Tax { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;
}