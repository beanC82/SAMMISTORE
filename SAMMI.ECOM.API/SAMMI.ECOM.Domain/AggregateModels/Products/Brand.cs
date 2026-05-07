using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Products;

[Table("Brand")]
public partial class Brand : Entity
{
    [Column("Code")]
    [Required]
    [StringLength(256)]
    public string Code { get; set; } = null!;

    [Column("Name")]
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [ForeignKey("Image")]
    [Column("ImageId")]
    public int? ImageId { get; set; }


    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    public virtual Image? Image { get; set; }
}