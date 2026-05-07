using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

[Table("Event")]
public partial class Event : Entity
{
    [Column("Code")]
    [MaxLength(256)]
    public string Code { get; set; } = null!;

    [Column("Name")]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Column("StartDate")]
    public DateTime StartDate { get; set; }

    [Column("EndDate")]
    public DateTime EndDate { get; set; }

    [Column("EventType")]
    [MaxLength(50)]
    public string? EventType { get; set; }

    [ForeignKey("Image")]
    [Column("ImageId")]
    public int? ImageId { get; set; }

    [Column("Description")]
    [StringLength(int.MaxValue)]
    public string? Description { get; set; }

    public virtual ICollection<Voucher> Vouchers { get; set; } = new List<Voucher>();
    public virtual Image? Image { get; set; }
}