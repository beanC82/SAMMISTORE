using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Products;

[Table("Image")]
public partial class Image : Entity
{
    [Column("ImageUrl")]
    [StringLength(255)]
    public string? ImageUrl { get; set; }

    [Column("PublicId")]
    [StringLength(255)]
    public string? PublicId { get; set; }

    [Column("TypeImage")]
    [StringLength(50)]
    public string? TypeImage { get; set; }

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    public virtual ICollection<User> UserImages { get; set; } = new List<User>();
    public virtual ICollection<Event> EventImages { get; set; } = new List<Event>();
    public virtual ICollection<Brand> BrandImages { get; set; } = new List<Brand>();
    public virtual ICollection<Banner> BannerImages { get; set; } = new List<Banner>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
