using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Products;

[Table("ProductCategory")]
public partial class ProductCategory : Entity
{
    [Column("Code")]
    [StringLength(256)]
    public string Code { get; set; } = null!;

    [Column("Name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [ForeignKey("Parent")]
    public int? ParentId { get; set; }

    [Column("Level")]
    public int Level { get; set; }

    public virtual ProductCategory? Parent { get; set; }


    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}