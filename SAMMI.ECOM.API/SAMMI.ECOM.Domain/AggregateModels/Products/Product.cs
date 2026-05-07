using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Products;

[Table("Product")]
public partial class Product : Entity
{
    [Column("Code")]
    [Required]
    [StringLength(256)]
    public string Code { get; set; } = null!;

    [Column("Name")]
    [Required]
    [StringLength(500)]
    public string Name { get; set; } = null!;

    [Column("StockQuantity")]
    [Required]
    public int StockQuantity { get; set; }

    [Column("Price")]
    [Required]
    public decimal Price { get; set; }

    [Column("ImportPrice")]
    public decimal? ImportPrice { get; set; }

    [Column("Discount")]
    [Required]
    public decimal? Discount { get; set; }

    [Column("Ingredient")]
    public string? Ingredient { get; set; }

    [Column("Uses")]
    public string? Uses { get; set; }

    [Column("UsageGuide")]
    public string? UsageGuide { get; set; }

    [Column("Status")]
    public int? Status { get; set; }

    [ForeignKey("Brand")]
    public int? BrandId { get; set; }

    [ForeignKey("Category")]
    public int? CategoryId { get; set; }

    [Column("StartDate")]
    public DateTime? StartDate { get; set; }

    [Column("EndDate")]
    public DateTime? EndDate { get; set; }

    public virtual Brand? Brand { get; set; }
    public virtual ProductCategory? Category { get; set; }

    public virtual ICollection<FavouriteProduct> FavouriteProducts { get; set; } = new List<FavouriteProduct>();
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    public virtual ICollection<PurchaseOrderDetail> PurchaseOrderDetails { get; set; } = new List<PurchaseOrderDetail>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<CartDetail> CartDetails { get; set; } = new List<CartDetail>();
}