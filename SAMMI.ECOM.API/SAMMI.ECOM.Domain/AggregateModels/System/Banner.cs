using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.System;

[Table("Banner")]
public partial class Banner : Entity
{
    [Column("Name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [ForeignKey("Image")]
    [Column("ImageId")]
    public int? ImageId { get; set; }

    [Column("Level")]
    public int Level { get; set; }

    public virtual Image? Image { get; set; }
}
