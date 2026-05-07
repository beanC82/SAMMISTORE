using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Others;

[Table("FavouriteProduct")]
public partial class FavouriteProduct : Entity
{
    [ForeignKey("Customer")]
    public int CustomerId { get; set; }

    [ForeignKey("Product")]
    public int ProductId { get; set; }

    public virtual User Customer { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}