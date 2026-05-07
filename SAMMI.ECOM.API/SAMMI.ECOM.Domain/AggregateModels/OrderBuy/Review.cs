using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
[Table("Review")]
public partial class Review : Entity
{
    [ForeignKey("Product")]
    public int ProductId { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }

    [Column("Rating")]
    [Range(1, 5)]  // Đảm bảo Rating phải nằm trong khoảng từ 1 đến 5
    public int Rating { get; set; }

    [Column("Comment")]
    public string? Comment { get; set; }

    [ForeignKey("Image")]
    public int? ImageId { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual User User { get; set; } = null!;
    public virtual Image? Image { get; set; }
}